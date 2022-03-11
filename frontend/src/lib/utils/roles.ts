import { User, UserRole } from "../api/models";

/** Type represents the permissions of a user for a given context */
export type Permission = {
    modify: boolean;
    delete: boolean;
}

function convertRoleToNumber(role: UserRole): number {
    switch (role) {
        case "administrator":
            return 2;
        case "moderator":
            return 1;
        default:
            return 0;
        }
}

export function ensureElevatedPermission(givenRole: UserRole, expectedRole: UserRole): boolean {
    const expectedValue = convertRoleToNumber(expectedRole);
    const givenValue = convertRoleToNumber(givenRole);

    return givenValue >= expectedValue;
}

export function computeUserPermission(ownerId: string, user: User): Permission {
    const permission = { 
        modify: false,
        delete: false,
    };

    // If the user is the owner of the document, then we can be sure that they 
    // can perform modification/deletion operations on the object.
    if (ownerId === user.id) {
        return {
            modify: true,
            delete: true
        }
    }

    if (user.role !== "default") permission.modify = true;
    if (user.role === "administrator") permission.delete = true;

    return permission;
}
