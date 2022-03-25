import assert from 'assert';
import supertest from 'supertest';

import { IUser } from '../../../src/models/User';

export type AuthenticationResponse = {
    token: string;
    refreshToken: string;
    user: IUser & { id: string }; // @@Hack: we should use TransformedUser or something
};

/**
 * Utility function to create a user and return authentication tokens
 * after creating the user via the `/register` endpoint.
 *
 * @param username
 * @returns The token from logging in the user
 */
export async function registerUserAndAuthenticate(
    requester: supertest.SuperTest<supertest.Test>,
    user: IUser,
): Promise<AuthenticationResponse> {
    // Verify that the user can register an account
    const registerResponse = await requester.post('/auth/register').send({
        ...user,
    });

    assert(registerResponse.status === 201 && registerResponse.body.status === 'ok');

    // Verify that the user can now login in after registering
    const loginResponse = await requester.post('/auth/login').send({
        username: user.username,
        password: user.password,
    });

    return {
        token: loginResponse.body.token,
        refreshToken: loginResponse.body.refreshToken,
        user: loginResponse.body.user,
    };
}
