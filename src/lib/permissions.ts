import mongoose from 'mongoose';

import * as errors from '../common/errors';
import Comment from '../models/Comment';
import Publication from '../models/Publication';
import Review, { IReviewStatus } from '../models/Review';
import User, { IUserDocument, IUserRole } from '../models/User';
import { BasicRequest } from './requests';

export interface Permission {
    level: IUserRole;
}

/**
 * This is a function that is defined for some endpoint that is used to determined whether some
 * request given it's context has permissions to perform a particular request in the given
 * context.
 */
export type PermissionVerificationFn<P, Q> = (
    user: IUserDocument,
    req: BodylessBasicRequest<P, Q>,
) => Promise<ResolvedPermission>;

type BodylessBasicRequest<P, Q> = Omit<BasicRequest<P, Q, unknown>, 'body'>;

/**
 * This is a type that represents what the permission verification function can return when
 * resolving a permission query.
 */
export type ResolvedPermission =
    | {
          valid: false;
          code?: 401 | 400 | 404;
          message?: string;
      }
    | {
          valid: true;
          user: IUserDocument;
      };

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
export async function ensureValidPermissions<P, Q>(
    permission: Permission | null,
    id: string,
    req: Omit<BasicRequest<P, Q, unknown>, 'body'>,
    verifyPermission: PermissionVerificationFn<P, Q>,
): Promise<ResolvedPermission> {
    if (permission === null) return { valid: false };

    // Lookup the user in the current request
    const user = await User.findById(id);

    if (!user) return { valid: false };

    const requiredPermission = userRoleToInt(permission.level);
    const acquiredPermission = userRoleToInt(user.role);

    if (acquiredPermission >= requiredPermission) {
        return { valid: true, user };
    }

    return verifyPermission(user, req);
}

/**
 * We essentially default to failing the request for verifying if a request has permissions
 * to make a request. This is done to prevent registered routes who don't have a defined
 * permission verifying function from passing the permission test.
 *
 * @param req - Generic request without a body
 * @returns - Failed permission verification
 */
export const defaultPermissionVerifier = async <P, Q>(
    _user: IUserDocument,
    _req: BodylessBasicRequest<P, Q>,
): Promise<ResolvedPermission> => {
    return { valid: false };
};

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
 *
 * @param req - Generic request without a body
 * @returns Whether or not the request to modify user endpoints is valid
 */
export const verifyUserPermission = async <P extends UserParamsRequest, Q extends UserQueryRequest>(
    user: IUserDocument,
    req: BodylessBasicRequest<P, Q>,
): Promise<ResolvedPermission> => {
    if (req.query.mode === 'id') {
        if (user._id === req.params.username) {
            return { valid: true, user };
        }
    } else {
        if (user.username === req.params.username) {
            return { valid: true, user };
        }
    }

    return { valid: false };
};

/**
 *
 * @param req
 * @returns
 */
export const verifyCommentPermission = async <P extends IdRequest, Q>(
    user: IUserDocument,
    req: BodylessBasicRequest<P, Q>,
): Promise<ResolvedPermission> => {
    const comment = await Comment.findById(req.params.id).exec();

    if (!comment) {
        return { valid: false, code: 404, message: errors.RESOURCE_NOT_FOUND };
    } else if (comment.owner.toString() !== user.id) {
        return { valid: false };
    }

    return { valid: true, user };
};

/**
 *
 * @param req
 * @returns
 */
export const verifyCommentThreadPermission = async <P extends IdRequest, Q>(
    user: IUserDocument,
    req: BodylessBasicRequest<P, Q>,
): Promise<ResolvedPermission> => {
    const commentThread = await Comment.findOne({ thread: req.params.id, replying: null }).exec();

    if (!commentThread) {
        return { valid: false, code: 404, message: errors.RESOURCE_NOT_FOUND };
    } else if (commentThread.owner.toString() !== user.id) {
        return { valid: false };
    }

    return { valid: true, user };
};

/**
 *
 * @param req
 * @returns
 */
export const verifyReviewPermission = async <P extends IdRequest, Q>(
    user: IUserDocument,
    req: BodylessBasicRequest<P, Q>,
): Promise<ResolvedPermission> => {
    const review = await Review.findById(req.params.id).exec();

    // prevent requesters who aren't owners viewing reviews that are currently
    // still incomplete. If the status of the review is completed, all individuals
    // should be able to see the review...
    //
    // @@TODO: in the future, it should be possible to make a review private and specify
    //         who can view the review.
    if (!review) {
        return { valid: false, code: 404, message: errors.RESOURCE_NOT_FOUND };
    } else if (
        !review ||
        (review.status !== IReviewStatus.Completed && review.owner.toString() !== user.id)
    ) {
        return { valid: false };
    }

    return { valid: true, user };
};

/**
 *
 * @param req
 * @returns
 */
export const verifyPublicationPermission = async <P extends PublicationRequest, Q>(
    user: IUserDocument,
    req: BodylessBasicRequest<P, Q>,
): Promise<ResolvedPermission> => {
    const publication = await Publication.findOne({ owner: user.id, name: req.params.name }).exec();

    if (!publication) {
        return { valid: false, message: errors.RESOURCE_NOT_FOUND, code: 404 };
    }

    if (publication.owner.toString() !== user.id) {
        return { valid: false };
    }

    return { valid: true, user };
};

/**
 *
 * @param req
 * @returns
 */
export const verifyPublicationIdPermission = async <P extends IdRequest, Q>(
    user: IUserDocument,
    req: BodylessBasicRequest<P, Q>,
): Promise<ResolvedPermission> => {
    const publication = await Publication.findById(req.params.id).exec();

    if (!publication) {
        return { valid: false, code: 404, message: errors.RESOURCE_NOT_FOUND };
    } else if (publication.owner.toString() !== user.id) {
        return { valid: false };
    }

    return { valid: true, user };
};
