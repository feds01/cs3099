import mongoose from 'mongoose';

import * as errors from '../../common/errors';
import Comment from '../../models/Comment';
import Publication, { PopulatedPublication } from '../../models/Publication';
import Review, { IReviewStatus } from '../../models/Review';
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
    /**
     * Even if the user has appropriate permissions, we still want to run the permission function to perform
     * further verification.
     */
    runPermissionFn?: boolean;
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
 * @param permission - The permission variant enum
 * @returns Role represented as an integer.
 */
export function userRoleToInt(permission: IUserRole) {
    switch (permission) {
        case IUserRole.Moderator:
            return 1;
        case IUserRole.Administrator:
            return 2;
        default:
            return 0;
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
 * Method to verify that a request in regards to the user sub-system has the appropriate
 * permissions.
 *
 * @param user - The requester
 * @param req - Object representing the parameters and query of the request.
 * @returns Whether or not the request to modify user endpoints is valid
 */
export const verifyUserPermission: PermissionVerificationFn<
    UserParamsRequest,
    UserQueryRequest,
    undefined
> = async (user, req, context): Promise<ResolvedPermission<undefined>> => {
    if (context.satisfied) return { valid: true, user };

    // Check if the user id/username is the same as the requester
    if (req.query.mode === 'id') {
        if (user._id.toString() === req.params.username) {
            return { valid: true, user };
        }
    } else if (user.username === req.params.username) {
        return { valid: true, user };
    }

    return { valid: false };
};

/**
 * This function is used to verify that user requests are allowed using @see verifyUserPermission but
 * with the additional constraint that the user document in question and the requester must have the same
 * or the requester has a higher permissions.
 *
 * @param user - The requester
 * @param req - Object representing the parameters and query of the request.
 * @returns Whether or not the request to modify user endpoints is valid
 */
export const verifyUserWithElevatedPermission: PermissionVerificationFn<
    UserParamsRequest,
    UserQueryRequest,
    IUserDocument
> = async (user, req, context) => {
    const queriedUser = await expr(async () => {
        const { mode } = req.query;
        const { username } = req.params;

        if (mode === 'id') {
            return await User.findById(username).exec();
        }
        return await User.findOne({ username }).exec();
    });

    // If we couldn't find the user... just return a 404
    if (!queriedUser) {
        return { valid: false, code: 404, message: errors.RESOURCE_NOT_FOUND };
    }

    if (queriedUser._id?.toString() === user._id?.toString()) {
        return { valid: true, user, data: queriedUser };
    }

    // Ensure that the user has higher or the same privileges as the queried user;
    if (!context.satisfied || !compareUserRoles(user.role, queriedUser.role)) {
        return { valid: false };
    }

    return { valid: true, user, data: queriedUser };
};

/**
 * Function to verify that the requester has permissions to perform operations
 * on the given comment.
 *
 * @param user - The requester
 * @param req - Object representing the parameters and query of the request.
 * @returns Whether or not the request to modify user endpoints is valid
 */
export const verifyCommentPermission: PermissionVerificationFn<
    IdRequest,
    unknown,
    undefined
> = async (user, req, context) => {
    if (context.satisfied) return { valid: true, user };

    const comment = await Comment.findById(req.params.id).exec();

    if (!comment) {
        return { valid: false, code: 404, message: errors.RESOURCE_NOT_FOUND };
    }
    if (comment.owner.toString() !== user._id.toString()) {
        return { valid: false };
    }

    return { valid: true, user };
};

/**
 * Function that verifies that the requester has permissions to perform operations
 * on the given comment using @see verifyCommentPermission, and further verifies that
 * the requester has equal or elevated permissions than the owner of the comment.
 *
 * @param user
 * @param req
 */
export const verifyCommentWithElevatedPermission: PermissionVerificationFn<
    IdRequest,
    unknown,
    undefined
> = async (user, req, context) => {
    const comment = await Comment.findById(req.params.id)
        .populate<{ owner: IUserDocument }>('owner')
        .exec();

    if (!comment) {
        return { valid: false, code: 404, message: errors.RESOURCE_NOT_FOUND };
    }

    if (comment.owner._id?.toString() === user._id?.toString()) {
        return { valid: true, user };
    }

    // Ensure that the user has higher or the same privileges as the queried user
    if (!context.satisfied || !compareUserRoles(user.role, comment.owner.role)) {
        return { valid: false };
    }

    return { valid: true, user };
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
    undefined
> = async (user, req, context) => {
    const review = await Review.findById(req.params.id).exec();

    // prevent requesters who aren't owners viewing reviews that are currently
    // still incomplete. If the status of the review is completed, all individuals
    // should be able to see the review...
    if (!review) {
        return { valid: false, code: 404, message: errors.RESOURCE_NOT_FOUND };
    }

    if (!context.satisfied && review.owner.toString() !== user._id?.toString()) {
        return { valid: false };
    }

    // If the review is incomplete, we will only allow users that have at least a moderator role set
    if (
        review.owner.toString() !== user._id?.toString() &&
        review.status !== IReviewStatus.Completed &&
        !compareUserRoles(user.role, IUserRole.Moderator)
    ) {
        return { valid: false, code: 404, message: errors.RESOURCE_NOT_FOUND };
    }

    return { valid: true, user };
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
        .populate<{ owner: IUserDocument }>('owner')
        .exec();

    if (!publication) {
        return { valid: false, message: errors.RESOURCE_NOT_FOUND, code: 404 };
    }

    if (!context.satisfied && publication.owner._id.toString() !== user._id.toString()) {
        return { valid: false };
    }

    return { valid: true, user, data: publication };
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
export const verifyRevisonlessPublicationPermission: PermissionVerificationFn<
    PublicationRequest & UserParamsRequest,
    UserQueryRequest,
    undefined
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

    if (!context.satisfied && publication.owner._id.toString() !== user._id.toString()) {
        return { valid: false };
    }

    return { valid: true, user };
};

/**
 *
 * Function that verifies that the requester can perform operations on a publications
 * via a @see verifyPublicationPermission, and further verifies that the requester has
 * the same or elevated privileges than the owner of the document.
 *
 * @param user - The requester
 * @param req - Object representing the parameters and query of the request.
 * @returns Whether or not the request to modify user endpoints is valid
 */
export const verifyPublicationWithElevatedPermission: PermissionVerificationFn<
    PublicationRequest,
    unknown,
    PopulatedPublication
> = async (user, req, context) => {
    const publication = await Publication.findOne({
        owner: user._id?.toString(),
        name: req.params.name.toLowerCase(),
    })
        .populate<{ owner: IUser }>('owner')
        .exec();

    if (!publication) {
        return { valid: false, message: errors.RESOURCE_NOT_FOUND, code: 404 };
    }

    // if this is the owner of the publication, this is an allowed modification
    if (publication.owner._id?.toString() === user._id?.toString()) {
        return { valid: true, user, data: publication };
    }

    // Ensure that the user has higher or the same privileges as the queried user
    if (!context.satisfied || !compareUserRoles(user.role, publication.owner.role)) {
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
        .populate<{ owner: IUserDocument }>('owner')
        .exec();

    if (!publication) {
        return { valid: false, code: 404, message: errors.RESOURCE_NOT_FOUND };
    }
    if (!context.satisfied && publication.owner.toString() !== user._id.toString()) {
        return { valid: false };
    }

    return { valid: true, user, data: publication };
};
