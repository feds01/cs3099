import Logger from '../common/logger';
import Comment from '../models/Comment';
import Publication from '../models/Publication';
import User, { IUserDocument, IUserRole } from '../models/User';

export type PermissionKind =
    | 'comment'
    | 'user'
    | 'resource'
    | 'publication'
    | 'review'
    | 'follower';

export interface Permission {
    kind: PermissionKind;
    level: IUserRole;
}

type ResolvedPermission =
    | {
          valid: false;
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

export type ExternalId =
    | {
          type: 'publication';
          name: string;
      }
    | {
          type: 'id';
          id: string;
      };

/**
 * Check if a user has sufficient permissions.
 *
 * @param permission - The required permission
 * @param id - The id of the user in question.
 * @returns If the user permissions are sufficient, and the user object if they are sufficient.
 */
export async function ensureValidPermissions(
    permission: Permission | null,
    id: string,
    externalId?: ExternalId,
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

    // We can't actually perform a specific subsystem check if no external id is provided
    if (typeof externalId === 'undefined') {
        Logger.warn('Attempted to verify permissions via sub-system without externalId');
        return { valid: false };
    }

    let findQuery = {};

    if (externalId.type === 'publication') {
        findQuery = { name: externalId.name };
    } else if (externalId.type === 'id') {
        findQuery = { id: externalId.id };
    }

    // Ok here, we need to actually perform some more advanced checks based on the type of permission that is requested
    switch (permission.kind) {
        case 'comment': {
            const comment = await Comment.findOne(findQuery).exec();

            if (!comment || comment.owner.toString() !== user.id) {
                return { valid: false };
            }

            return { valid: true, user };
        }
        case 'user': {
            // TODO: Add permission sub-system for user
            return { valid: false };
        }
        case 'resource': {
            // TODO: Add permission sub-system for resource
            return { valid: false };
        }
        case 'publication': {
            const publication = await Publication.findOne({ owner: user.id, ...findQuery }).exec();

            if (!publication || publication.owner.toString() !== user.id) {
                return { valid: false };
            }

            return { valid: true, user };
        }
        case 'review': {
            // TODO: Add permission sub-system for review
            return { valid: false };
        }
        case 'follower': {
            // TODO: Add permission sub-system for follower
            return { valid: false };
        }
        default: {
            return { valid: false };
        }
    }
}
