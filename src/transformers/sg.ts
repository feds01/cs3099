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
    const { name, email, user_id: id, profilePictureUrl } = user;

    const firstName = name.substr(0, name.indexOf(' '));
    const lastName = name.substr(name.indexOf(' ') + 1);

    return {
        username: id.id, // TODO: this is somewhat flaky since what if the username is already taken?
        firstName,
        lastName,
        password: '',
        profilePictureUrl,
        email,
        externalId: convertSgId(id),
    };
}
