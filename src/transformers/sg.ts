import User, { IUser } from '../models/User';
import { SgUser } from '../validators/sg';

/**
 * Function to transform a Supergroup User type into an internal user that
 * can be saved in the database.
 *
 * @param user - The Supergroup user
 * @returns - Internal user model.
 */
export function transformSgUserToInternal(user: SgUser): IUser {
    const { name, email, id, profilePictureUrl } = user;

    const firstName = name.substr(0, name.indexOf(' '));
    const lastName = name.substr(name.indexOf(' ') + 1);

    return new User({
        username: id.id, // TODO: this is somewhat flaky since what if the username is already taken?
        firstName,
        lastName,
        password: '',
        profilePictureUrl,
        email,
        externalId: `${id.id}:${id.group}`,
    });
}
