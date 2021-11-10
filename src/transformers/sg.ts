import { IUserDocument } from '../models/User';
import { SgUser } from '../validators/sg';

/**
 * Function to transform a Supergroup User type into an internal user that
 * can be saved in the database.
 *
 * @param user - The Supergroup user
 * @returns - Internal user model.
 */
export function transformSgUserToInternal(user: SgUser): Partial<IUserDocument> & { username: string; email: string; } {
    const { name, email, user_id, profilePictureUrl } = user;

    const firstName = name.substr(0, name.indexOf(' '));
    const lastName = name.substr(name.indexOf(' ') + 1);

    return {
        username: user_id.id, // TODO: this is somewhat flaky since what if the username is already taken?
        firstName,
        lastName,
        password: '',
        profilePictureUrl,
        email,
        externalId: `${user_id.id}:${user_id.group}`,
    };
}
