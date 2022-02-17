import { User } from "../api/models";

/** Type represents the permissions of a user for a given context */
export type Permission = {
    modify: boolean;
    delete: boolean;
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
