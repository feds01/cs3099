/* eslint no-constant-condition: ["error", { "checkLoops": false }] */
import { Config, adjectives, animals, colors, uniqueNamesGenerator } from 'unique-names-generator';

import User from '../models/User';
import { expr } from '../utils/expr';
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

interface TransformedSgUser {
    username: string;
    email: string;
    name: string;
    password: string;
    profilePictureUrl?: string;
    externalId: string;
}

/**
 * Function to transform a Supergroup User type into an internal user that
 * can be saved in the database.
 *
 * @param user - The Supergroup user
 * @param username - Whether or not we should be using an already existant
 * username instead of generating a new one.
 * @returns - Internal user model.
 */
export async function transformSgUserToInternal(
    user: SgUser,
    username?: string,
): Promise<TransformedSgUser> {
    const { name, email, id, profilePictureUrl } = user;

    // We will generate a username and then check if that username is taken, we
    // keep generating until we find a unique username and then we can use it
    const customConfig: Config = {
        dictionaries: [adjectives, colors, animals],
        separator: '-',
        length: 3,
    };

    const chosenName = await expr(async () => {
        if (typeof username === 'string') return username;

        /* eslint-disable no-await-in-loop */
        while (true) {
            const generatedUsername = uniqueNamesGenerator(customConfig);
            const doc = await User.findOne({ username: generatedUsername }).exec();

            if (doc === null) {
                return generatedUsername;
            }
        }
        /* eslint-enable no-await-in-loop */
    });

    return {
        username: chosenName,
        name,
        password: '',
        profilePictureUrl,
        email,
        externalId: convertSgId(id),
    };
}
