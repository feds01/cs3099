import User, { IUserDocument, IUserRole } from '../models/User';

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
export function permissionToInt(permission: IUserRole) {
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
export function comparePermissions(left: IUserRole, right: IUserRole): boolean {
    const leftPermission = permissionToInt(left);
    const rightPermission = permissionToInt(right);

    return leftPermission >= rightPermission;
}

/**
 * Check if a user has sufficient permissions.
 *
 * @param permission - The required permission
 * @param id - The id of the user in question.
 * @returns If the user permissions are sufficient, and the user object if they are sufficient.
 */
export async function ensureValidPermissions(
    permission: IUserRole | null,
    id: string,
): Promise<ResolvedPermission> {
    if (permission === null) return { valid: false };

    // Lookup the user in the current request
    const user = await User.findById(id);

    if (!user) return { valid: false };

    const requiredPermission = permissionToInt(permission);
    const acquiredPermission = permissionToInt(user.role);

    if (acquiredPermission >= requiredPermission) {
        return { valid: true, user };
    }
    return { valid: false };
}
