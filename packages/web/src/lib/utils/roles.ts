import { Review, User, UserRole } from '../api/models';

/** Extended user role used to provide more context about reviewers */
export type ExtendedRole = UserRole | 'owner' | 'collaborator' | 'reviewer';

/** Type represents the permissions of a user for a given context */
export type Permission = {
    modify: boolean;
    delete: boolean;
};

/**
 * Function to convert a role into a numeric value.
 *
 * @param role
 * @returns
 */
function convertRoleToNumber(role: UserRole): number {
    switch (role) {
        case 'administrator':
            return 2;
        case 'moderator':
            return 1;
        default:
            return 0;
    }
}

/**
 * Function to verify that the user has a sufficient permission to perform an
 * operation as specified by the `expectedRole` argument.
 *
 * @param givenRole - The role that the user currently has.
 * @param expectedRole - The minimum role that is required.
 * @returns If the user has sufficient permissions.
 */
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
            delete: true,
        };
    }

    if (user.role !== 'default') permission.modify = true;
    if (user.role === 'administrator') permission.delete = true;

    return permission;
}

/**
 * Function to compute a role in the context of a review and a comment author.
 * This function is used to compute whether the comment author is the owner
 * of the publication, publication collaborator or if they are a the original
 * reviewer.
 */
export function computeReviewRole(review: Review, author: User): ExtendedRole {
    if (author.id === review.owner.id) {
        return 'reviewer';
    }

    // Check if the user is the owner of the publication
    if (author.id === review.publication.owner.id) {
        return 'owner';
    }

    // Check if the user is a collaborator of the publication
    if (review.publication.collaborators.map((user) => user.id).find((id) => id === author.id)) {
        return 'collaborator';
    }

    return 'default';
}
