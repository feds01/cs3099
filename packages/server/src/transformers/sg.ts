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
 * @returns - Internal user model.
 */
export function transformSgUserToInternal(
    user: SgUser,
    username?: string,
): Promise<TransformedSgUser> {
    const { name, email, id, profilePictureUrl } = user;

    return {
        username: id.id, // TODO: this is somewhat flaky since what if the username is already taken?
        name,
        password: '',
        profilePictureUrl,
        email,
        externalId: convertSgId(id),
    };
}
