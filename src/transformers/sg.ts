import { IUserDocument } from '../models/User';
import { SgUser, SgUserId } from '../validators/sg';

/**
 * Convert a Supergroup id into a normal string.
 *
 * @param external - The external id
 * @returns The id converted into a normal string.
 */
export function convertSgId(external: SgUserId): string {
    return `${external.id}:${external.group}`;
}

/**
 * Function to transform a Supergroup User type into an internal user that
 * can be saved in the database.
 *
 * @param user - The Supergroup user
 * @returns - Internal user model.
 */
export function transformSgUserToInternal(
    user: SgUser,
): Partial<IUserDocument> & { username: string; email: string } {
    const { name, email, id, profilePictureUrl } = user;

    return {
        username: id.id,
        name,
        password: '',
        profilePictureUrl,
        email,
        externalId: convertSgId(id),
    };
}
