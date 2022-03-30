import mongoose from 'mongoose';

import * as errors from '../../common/errors';
import Activity, { PopulatedActivity } from '../../models/Activity';
import Comment, { PopulatedComment } from '../../models/Comment';
import Notification, { PopulatedNotification } from '../../models/Notification';
import Publication, {
    AugmentedPublicationDocument,
    PopulatedPublication,
} from '../../models/Publication';
import Review, { IReviewStatus, PopulatedReview } from '../../models/Review';
import User, { AugmentedUserDocument, IUser, IUserDocument, IUserRole } from '../../models/User';
import { expr } from '../../utils/expr';
import { transformUsernameIntoId } from '../../utils/users';
import { BasicRequest } from './requests';

/**
 * Type representing a endpoints permission requirements from the requester
 * in order to execute the operation.
 */
export interface Permission {
    /** The expected level of permissions that the endpoint requires */
    level: IUserRole;
}

export interface PermissionContext {
    minimum: IUserRole;
    satisfied: boolean;
}

type BodylessBasicRequest<P, Q> = Omit<BasicRequest<P, Q, unknown, unknown>, 'body'>;

/**
 * This is a type that represents what the permission verification function can return when
 * resolving a permission query.
 */
export type ResolvedPermission<T> =
    | {
          valid: false;
          code?: 401 | 400 | 404;
          message?: string;
      }
    | ({ valid: true; user: AugmentedUserDocument } & T extends undefined
          ? { valid: true; user: AugmentedUserDocument }
          : { valid: true; user: AugmentedUserDocument; data: T });

/**
 * This is a function that is defined for some endpoint that is used to determined whether some
 * request given it's context has permissions to perform a particular request in the given
 * context.
 */
export type PermissionVerificationFn<P, Q, T> = (
    user: AugmentedUserDocument,
    req: BodylessBasicRequest<P, Q>,
    context: PermissionContext,
) => Promise<ResolvedPermission<T>>;

/**
 * Convert a permission into an integer.
 *
 * @param role - The permission variant enum
 * @returns Role represented as an integer.
 */
export function userRoleToInt(role: IUserRole): 0 | 1 | 2 {
    switch (role) {
        case IUserRole.Moderator:
            return 1;
        case IUserRole.Administrator:
            return 2;
        default:
            return 0;
    }
}

/**
 * Utility function to generate a comprehensive list of roles that a particular role
 * matches or has higher privileges. This utility method is useful when the API
 * needs to filter for documents that require a particular permission to be read.
 *
 * @param role - The role to use when generating the list
 * @returns A list of roles
 */
export function generateComprehensiveRoleList(role: IUserRole): IUserRole[] {
    switch (role) {
        case IUserRole.Moderator:
            return [role, IUserRole.Default];
        case IUserRole.Administrator:
            return [role, IUserRole.Moderator, IUserRole.Default];
        default:
            return [role];
    }
}

/**
 * Compare two permissions.
 *
 * @param left - Left hand-side permission.
 * @param right - Right hand-side permission.
 * @returns If the left hand-side permission is greater or equal to right hand-side.
 */
export function compareUserRoles(left: IUserRole, right: IUserRole): boolean {
    const leftPermission = userRoleToInt(left);
    const rightPermission = userRoleToInt(right);

    return leftPermission >= rightPermission;
}

/**
 * Check if a user has sufficient permissions.
 *
 * @param permission - The required permission
 * @param id - The id of the user in question.
 * @returns If the user permissions are sufficient, and the user object if they are sufficient.
 */
export async function ensureValidPermissions<P, Q, T>(
    permission: Permission | null,
    id: string,
    req: Omit<BasicRequest<P, Q, unknown, unknown>, 'body'>,
    verifyPermission: PermissionVerificationFn<P, Q, T>,
): Promise<ResolvedPermission<T>> {
    if (permission === null) return { valid: false };

    // Lookup the user in the current request
    const user: AugmentedUserDocument | null = await User.findById(id);
    if (!user) return { valid: false };

    const context = {
        minimum: permission.level,
        satisfied: compareUserRoles(user.role, permission.level),
    };

    return await verifyPermission(user, req, context);
}

/**
 * We essentially default to failing the request for verifying if a request has permissions
 * to make a request. This is done to prevent registered routes who don't have a defined
 * permission verifying function from passing the permission test.
 *
 * @param _user - The requester
 * @param _req - Generic request without a body
 * @returns - Failed permission verification
 */
export const defaultPermissionVerifier: PermissionVerificationFn<
    unknown,
    unknown,
    undefined
> = async (user, _req, context): Promise<ResolvedPermission<undefined>> =>
    context.satisfied ? { valid: true, user } : { valid: false };

/**
 * This is a generic implementation of a function that returns
 */
interface IdRequest {
    id: mongoose.Types.ObjectId;
}

/**
 * This is a generic implementation of a function that returns
 */
interface PublicationRequest {
    name: string;
}

interface PublicationQueryRequest {
    revision?: string;
}

/**
 * This is a generic implementation of a function that returns
 */
interface UserParamsRequest {
    username: string;
}

interface UserQueryRequest {
    mode: 'username' | 'id';
}

/**
 * This function is used to verify that user requests are allowed using @see verifyUserPermission but
 * with the additional constraint that the user document in question and the requester must have the same
 * or the requester has a higher permissions.
 *
 * @param user - The requester
 * @param req - Object representing the parameters and query of the request.
 * @returns Whether or not the request to modify user endpoints is valid
 */
export const verifyUserPermission: PermissionVerificationFn<
    UserParamsRequest,
    UserQueryRequest,
    AugmentedUserDocument
> = async (user, req, context) => {
    const queriedUser = await expr(async () => {
        const { mode } = req.query;
        const { username } = req.params;

        if (mode === 'id') {
            return (await User.findById(username).exec()) as AugmentedUserDocument | null;
        }
        return (await User.findOne({ username }).exec()) as AugmentedUserDocument | null;
    });

    // If we couldn't find the user... just return a 404
    if (!queriedUser) {
        return { valid: false, code: 404, message: errors.RESOURCE_NOT_FOUND };
    }

    if (queriedUser._id.toString() === user._id.toString()) {
        return { valid: true, user, data: queriedUser };
    }

    // Ensure that the user has higher or the same privileges as the queried user;
    if (!context.satisfied && !compareUserRoles(user.role, queriedUser.role)) {
        return { valid: false };
    }

    return { valid: true, user, data: queriedUser };
};

/**
 * Function that verifies that the requester has permissions to perform operations
 * on the given comment using @see verifyCommentPermission, and further verifies that
 * the requester has equal or elevated permissions than the owner of the comment.
 *
 * @param user - The requester
 * @param req - Object representing the parameters and query of the request.
 * @returns Whether or not the request to modify user endpoints is valid
 */
export const verifyCommentPermission: PermissionVerificationFn<
    IdRequest,
    unknown,
    PopulatedComment
> = async (user, req, context) => {
    const comment = (await Comment.findById(req.params.id)
        .populate<{ owner: AugmentedUserDocument }>('owner')
        .exec()) as unknown as PopulatedComment | null;

    if (!comment) {
        return { valid: false, code: 404, message: errors.RESOURCE_NOT_FOUND };
    }

    if (comment.owner._id.toString() === user._id.toString()) {
        return { valid: true, user, data: comment };
    }

    // Ensure that the user has higher or the same privileges as the queried user
    if (!context.satisfied && !compareUserRoles(user.role, comment.owner.role)) {
        return { valid: false };
    }

    return { valid: true, user, data: comment };
};

/**
 * Function to verify that the requester has permissions to perform operations on
 * the specified comment thread.
 *
 * @param user - The requester
 * @param req - Object representing the parameters and query of the request.
 * @returns Whether or not the request to modify user endpoints is valid
 */
export const verifyCommentThreadPermission: PermissionVerificationFn<
    IdRequest,
    unknown,
    undefined
> = async (user, req, context) => {
    if (context.satisfied) return { valid: true, user };

    const commentThread = await Comment.findOne({ thread: req.params.id, replying: null }).exec();

    if (!commentThread) {
        return { valid: false, code: 404, message: errors.RESOURCE_NOT_FOUND };
    }
    if (commentThread.owner.toString() !== user._id.toString()) {
        return { valid: false };
    }

    return { valid: true, user };
};

/**
 * Function to verify that the requester has permissions to perform operations on
 * the given review.
 *
 * @param user - The requester
 * @param req - Object representing the parameters and query of the request.
 * @returns Whether or not the request to modify user endpoints is valid
 */
export const verifyReviewPermission: PermissionVerificationFn<
    IdRequest,
    unknown,
    PopulatedReview
> = async (user, req, context) => {
    const review = await Review.findById(req.params.id)
        .populate<{ owner: AugmentedUserDocument }>('owner')
        .populate<{ publication: AugmentedPublicationDocument }>('publication')
        .exec();

    // prevent requesters who aren't owners viewing reviews that are currently
    // still incomplete. If the status of the review is completed, all individuals
    // should be able to see the review...
    if (!review) {
        return { valid: false, code: 404, message: errors.RESOURCE_NOT_FOUND };
    }

    // If the review is incomplete, we will only allow users that have at least a moderator role set
    if (review.owner._id.toString() !== user._id.toString()) {
        if (
            review.status !== IReviewStatus.Completed &&
            !compareUserRoles(user.role, IUserRole.Moderator)
        ) {
            return { valid: false, code: 404, message: errors.RESOURCE_NOT_FOUND };
        } else if (!context.satisfied) {
            return { valid: false };
        }
    }

    return { valid: true, user, data: review };
};

/**
 * Function to verify that the requester has permissions to perform operations on
 * a given publication by using the name of the publication and the owner username of the
 * publication. This permission function does not require the request to contain
 * a 'revision' identifier since these operations are likely to be carried out on a
 * collection of publications rather than a single one.
 *
 * @param user - The requester
 * @param req - Object representing the parameters and query of the request.
 * @returns Whether or not the request to modify user endpoints is valid
 */
export const verifyRevisonlessPublicationPermission: PermissionVerificationFn<
    PublicationRequest & UserParamsRequest,
    UserQueryRequest,
    { filterDrafts: boolean }
> = async (user, req, context) => {
    const owner = await transformUsernameIntoId(req);
    const publication = await Publication.findOne({
        owner: owner._id.toString(),
        name: req.params.name.toLowerCase(),
    })
        .populate<{ owner: IUserDocument }>('owner')
        .exec();

    if (!publication) {
        return { valid: false, message: errors.RESOURCE_NOT_FOUND, code: 404 };
    }

    // if this is the owner of the publication, this is an allowed modification
    if (
        publication.owner._id.toString() === user._id.toString() ||
        publication.collaborators.find((id) => id.toString() === user._id.toString())
    ) {
        return { valid: true, user, data: { filterDrafts: false } };
    }

    if (!context.satisfied && !compareUserRoles(user.role, publication.owner.role)) {
        return { valid: false };
    }

    return {
        valid: true,
        user,
        data: { filterDrafts: compareUserRoles(user.role, IUserRole.Moderator) },
    };
};

/**
 * Function to verify that the requester has permissions to perform operations on
 * a given publication by using the name of the publication and the owner username of the
 * publication.
 *
 * @param user - The requester
 * @param req - Object representing the parameters and query of the request.
 * @returns Whether or not the request to modify user endpoints is valid
 */
export const verifyPublicationPermission: PermissionVerificationFn<
    PublicationRequest & UserParamsRequest,
    PublicationQueryRequest & UserQueryRequest,
    PopulatedPublication
> = async (user, req, context) => {
    const { revision } = req.query;

    const owner = await transformUsernameIntoId(req);
    const publication = await Publication.findOne({
        owner: owner._id.toString(),
        name: req.params.name.toLowerCase(),
        ...(typeof revision !== 'undefined' ? { revision } : { current: true }),
    })
        .populate<{ owner: IUser }>('owner')
        .exec();

    if (!publication) {
        return { valid: false, message: errors.RESOURCE_NOT_FOUND, code: 404 };
    }

    // if this is the owner of the publication, this is an allowed modification
    if (publication.owner._id.toString() === user._id.toString()) {
        return { valid: true, user, data: publication };
    }

    // If this is a collaborator, they can perform all the actions as long as the
    // required permission level is below 'admin'. This means that collaborators
    // should be able to revise/patch and upload sources to publications.
    if (publication.collaborators.find((id) => id.toString() === user._id.toString())) {
        if (context.minimum !== IUserRole.Administrator) {
            return { valid: true, user, data: publication };
        }
    }

    // If the publication is marked as draft, default users cannot view it yet!
    if (publication.draft && !compareUserRoles(user.role, IUserRole.Moderator)) {
        return { valid: false };
    }

    // Ensure that the user has higher or the same privileges as the queried user
    if (!context.satisfied && !compareUserRoles(user.role, publication.owner.role)) {
        return { valid: false };
    }

    return { valid: true, user, data: publication };
};

/**
 * Function to verify that the requester has permissions to perform operations on
 * a given publication by using the id of the publication.
 *
 * @param user - The requester
 * @param req - Object representing the parameters and query of the request.
 * @returns Whether or not the request to modify user endpoints is valid
 */
export const verifyPublicationIdPermission: PermissionVerificationFn<
    IdRequest,
    unknown,
    PopulatedPublication
> = async (user, req, context) => {
    const publication = await Publication.findById(req.params.id)
        .populate<{ owner: IUser }>('owner')
        .exec();

    if (!publication) {
        return { valid: false, code: 404, message: errors.RESOURCE_NOT_FOUND };
    }

    // if this is the owner of the publication, this is an allowed modification
    if (publication.owner._id?.toString() === user._id?.toString()) {
        return { valid: true, user, data: publication };
    }

    // If this is a collaborator, they can perform all the actions as long as the
    // required permission level is below 'admin'. This means that collaborators
    // should be able to revise/patch and upload sources to publications.
    if (publication.collaborators.find((id) => id.toString() === user._id.toString())) {
        if (context.minimum !== IUserRole.Administrator) {
            return { valid: true, user, data: publication };
        }
    }

    // If the publication is marked as draft, default users cannot view it yet!
    if (publication.draft && !compareUserRoles(user.role, IUserRole.Moderator)) {
        return { valid: false };
    }

    // Ensure that the user has higher or the same privileges as the queried user
    if (!context.satisfied && !compareUserRoles(user.role, publication.owner.role)) {
        return { valid: false };
    }

    return { valid: true, user, data: publication };
};

/**
 * Function to verify that the requester has permissions to perform operations on
 * a given activity by using the id of the publication.
 *
 * @param user - The requester
 * @param req - Object representing the parameters and query of the request.
 * @returns Whether or not the request to modify user endpoints is valid
 */
export const verifyActivityPermission: PermissionVerificationFn<
    IdRequest,
    unknown,
    PopulatedActivity
> = async (user, req, context) => {
    const activity = await Activity.findById(req.params.id)
        .populate<{ owner: IUser }>('owner')
        .exec();

    if (!activity || !activity.isLive) {
        return { valid: false, code: 404, message: errors.RESOURCE_NOT_FOUND };
    }

    // if this is the owner of the activity, this is an allowed modification
    if (activity.owner._id?.toString() === user._id.toString()) {
        return { valid: true, user, data: activity };
    }

    // Ensure that the user has higher or the same privileges as the queried user
    if (!context.satisfied && !compareUserRoles(user.role, activity.permission)) {
        return { valid: false };
    }

    return { valid: true, user, data: activity };
};

/**
 * Function to verify that the requester has permissions to perform operations on
 * a given notification by using the id of the publication.
 *
 * @param user - The requester
 * @param req - Object representing the parameters and query of the request.
 * @returns Whether or not the request to modify user endpoints is valid
 */
export const verifyNotificationPermission: PermissionVerificationFn<
    IdRequest,
    unknown,
    PopulatedNotification
> = async (user, req, context) => {
    const notification = await Notification.findById(req.params.id)
        .populate<{ author: IUser }>('author')
        .populate<{ tagging: IUser }>('tagging')
        .exec();

    if (!notification || !notification.isLive) {
        return { valid: false, code: 404, message: errors.RESOURCE_NOT_FOUND };
    }

    // if this is the owner of the publication, this is an allowed modification
    if (notification.tagging._id?.toString() === user._id?.toString()) {
        return { valid: true, user, data: notification };
    }

    // Ensure that the user has higher or the same privileges as the queried user
    if (!context.satisfied && !compareUserRoles(user.role, notification.author.role)) {
        return { valid: false };
    }

    return { valid: true, user, data: notification };
};
