import bcrypt from 'bcryptjs';
import express from 'express';
import { nanoid } from 'nanoid';
import { z } from 'zod';

import * as error from '../../common/errors';
import { createTokens, refreshTokens, verifyToken } from '../../lib/auth/auth';
import registerRoute from '../../lib/communication/requests';
import { ApiResponse } from '../../lib/communication/response';
import State from '../../models/State';
import User from '../../models/User';
import {
    IUserLoginRequestSchema,
    IUserRegisterRequestSchema,
    UsernameSchema,
} from '../../validators/user';
import { config } from './../../server';

const router = express.Router();

/**
 * @version v1.0.0
 * @method POST
 * @url /api/auth/username_validity
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/auth/username_validity
 *
 * >>> response:
 * {
 *  "status": "true",
 *  "message": "Username exists"
 * }
 *
 * @description This route is used to determine if a username is already in use, the route
 * will accept a token in the header of the request to authenticate the request.
 *
 * @error {UNAUTHORIZED} if the request does not contain a token or refreshToken
 *
 * @return sends a response to client if user successfully (or not) logged in. The response contains
 * whether username is in use.
 *
 * */
registerRoute(router, '/username_validity', {
    method: 'post',
    body: z.object({
        username: UsernameSchema,
    }),
    params: z.object({}),
    query: z.object({}),
    headers: z.object({}),
    permission: null,
    permissionVerification: undefined,
    handler: async (req) => {
        const result = await User.findOne({
            username: req.body.username,
        }).exec();

        return {
            status: 'ok',
            code: 200,
            data: {
                reserved: result !== null,
            },
        };
    },
});

/**
 * @version v1.0.0
 * @method POST
 * @url /api/auth/email_validity
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/auth/email_validitiy
 *
 * >>> response:
 * {
 *  "status": "true",
 *  "message": "Email exists"
 * }
 *
 * @description This route is used to determine if an email address is already in use, the route
 * will accept a token in the header of the request to authenticate the request.
 *
 * @error {UNAUTHORIZED} if the request does not contain a token or refreshToken
 *
 * @return sends a response to client if user successfully (or not) logged in. The response contains
 * whether the email is in use.
 *
 * */
registerRoute(router, '/email_validity', {
    method: 'post',
    body: z.object({
        email: z.string().email(),
    }),
    params: z.object({}),
    query: z.object({}),
    headers: z.object({}),
    permission: null,
    permissionVerification: undefined,
    handler: async (req) => {
        const result = await User.findOne({
            email: req.body.email,
            externalId: { $exists: false },
        }).exec();

        return {
            status: 'ok',
            code: 200,
            data: {
                reserved: result !== null,
            },
        };
    },
});

/**
 * @version v1.0.0
 * @method POST
 * @url /api/auth/session
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/auth/session
 *
 * @description This route is used to essentially refresh provided tokens and return a
 * user session with refreshed tokens.
 */
registerRoute(router, '/session', {
    method: 'post',
    body: z.object({ token: z.string(), refreshToken: z.string() }),
    params: z.object({}),
    query: z.object({}),
    headers: z.object({}),
    permission: null,
    permissionVerification: undefined,
    handler: async (req) => {
        const { token, refreshToken } = req.body;

        async function attemptToRefreshTokens(token: string): Promise<ApiResponse<unknown>> {
            const { sub: id } = await verifyToken(token, config.jwtRefreshSecret);
            const refreshedTokens = refreshTokens(token);

            // find the user with this token information
            const user = await User.findById(id);

            if (!user) {
                return {
                    status: 'error',
                    code: 400,
                    message: 'Invalid JWT',
                };
            }

            return {
                status: 'ok',
                code: 200,
                data: {
                    user: User.project(user),
                    ...refreshedTokens,
                },
            };
        }

        // attempt to refresh the tokens and create a user state from it.
        try {
            await verifyToken(token, config.jwtSecret);

            return attemptToRefreshTokens(refreshToken);
        } catch (e: unknown) {
            if (e instanceof error.ApiError) {
                if (e.message === 'Token expired') {
                    return attemptToRefreshTokens(refreshToken);
                }
            }

            throw e;
        }
    },
});

/**
 * @version v1.0.0
 * @method GET
 * @url /api/auth/sso
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/auth/sso
 *
 * @description This route is used to internally send of a request to sign on with a different
 * service instead of using the internal login process. It accepts a `to` url in the body which
 * is the service that the user selects to login as, and a path which is an optional path
 * that the user tries to internally sign-in before hitting the login screen. The optional
 * path can be used to re-direct the user back to the page once they've signed up and redirected
 * back.
 *
 */
registerRoute(router, '/sso', {
    method: 'post',
    query: z.object({ to: z.string().url(), path: z.string().optional() }),
    params: z.object({}),
    body: z.object({}),
    headers: z.object({}),
    permission: null,
    permissionVerification: undefined,
    handler: async (req) => {
        const { to, path } = req.query;

        // @Security: assert that the to URL is valid and exists in the supergroup service map.
        // create a new state using nano-id for url safe random strings
        const stateString = nanoid();

        await new State({
            state: stateString,
            from: to,
            path: path ?? '/', // re-direct the user back to / if the path isn't provided.
        }).save();

        // re-direct the user to the external service to begin the sso process...
        const url = new URL(
            `/api/sg/sso/login?state=${stateString}&from=${config.frontendURI}`,
            to,
        );

        return {
            status: 'ok',
            code: 200,
            data: {
                follow: url.toString(),
            },
        };
    },
});

/**
 * @version v1.0.0
 * @method POST
 * @url api/user/register
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/user/register
 * >>> body: {
 *     "email": "feds01@gmail.com",
 *     "name": "feds01",
 *     "password": "Password2020"
 * }
 *
 * @description This route is used to sign-up new users to the journal, the route will
 * accept a username, email & password within the request body. The password will be checked
 * to match the security criterion. Rules include the password length being at least 8 characters
 * long. Furthermore, the email will be validated against a common Regular expression to ensure
 * that bogus emails are not provided. Once input validation is passed, a search within the database
 * for the provided 'email' & 'username' to ensure that they are not already registered to another
 * user account. If all checks pass, the provided password is hashed, user initialisation is carried
 * out and the user data entry is added to the database. The route will send a 'CREATED' response if it
 * successfully created a user account.
 *
 * @param {String} name: a string which will represent the abbreviated name of the user. This does not have
 *        to be unique.
 * @param {String} email: a string in the format of an email, this will be used to carry out security
 *        checks on the user account & user notifications.
 *
 * @param {String} password: a string which will be the used for logging in and confirming sensitive operations.
 *
 * @error {BAD_REQUEST} if password does not match the security criterion.
 * @error {BAD_REQUEST} if the username is a null string, or contains illegal characters.
 * @error {INVALID_EMAIL} if the provided email does not match a standard email schema.
 * @error {MAIL_EXISTS} if the provided email/username is already registered to a user in the system.
 *
 * @return response to client if user was created and added to the system.
 * */
registerRoute(router, '/register', {
    method: 'post',
    body: IUserRegisterRequestSchema,
    params: z.object({}),
    query: z.object({}),
    headers: z.object({}),
    permission: null,
    permissionVerification: undefined,
    handler: async (req) => {
        // generate the salt for the new user account;
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(req.body.password, salt);

        const savedUser = await new User({ ...req.body, password: hash }).save();
        const { token, refreshToken } = createTokens(savedUser.id);

        return {
            status: 'ok',
            code: 201,
            data: {
                user: User.project(savedUser),
                token,
                refreshToken,
            },
        };
    },
});

/**
 * @version v1.0.0
 * @method POST
 * @url /api/user/login
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/user/login
 * >>> body: {
 *     "email": "feds01@gmail.com",
 *     "password": "Password2020"
 * }
 * >>> response: {
 *  "status": "ok",
 *  "token": ...,
 *  "refreshToken": ...,
 *  "user": {
 *      ...
 *  }
 * }
 *
 * @description This route is used to login users into the journal, the route
 * will accept a username or email & password within the request body. The method will determine
 * which authentication strategy the request is using. If an email is provided, the user will
 * be authenticated using email, and vice versa for username. If a user is found with email/username,
 * the sent over password will be compared with stored hash. If hash and password match, the request
 * will create two request tokens 'x-token' and 'x-refresh-token' and apply them to response header.
 * Additionally, the 'last_login' column is updated, and a 'USER_LOGIN' event is added in user's timeline.
 *
 * @param {string} email: a string in the format of an email, this will be used to carry out security
 * checks on the user account & user notifications.
 *
 * @param {string} password: a string which will be the used for logging in and confirming sensitive operations.
 *
 * @error {BAD_REQUEST} if no email field is provided in the request
 * @error {BAD_REQUEST} if no password field was provided in the request
 * @error {UNAUTHORIZED} if password does not match hash
 * @error {AUTHENTICATION_FAILED} if the username/email do not exist within the database,
 *
 * @return sends a response to client if user successfully (or not) logged in.
 *
 * */
registerRoute(router, '/login', {
    method: 'post',
    body: IUserLoginRequestSchema,
    params: z.object({}),
    query: z.object({}),
    headers: z.object({}),
    permission: null,
    permissionVerification: undefined,
    handler: async (req) => {
        const { username, password, isEmail } = req.body;

        const result = await User.findOne({
            ...(isEmail ? { email: username } : { username }),
            externalId: { $exists: false },
        }).exec();

        // Important to send an authentication failure request, rather than a
        // username not found. This could lead to a brute force attack to retrieve
        // all existent user names.
        if (!result) {
            return {
                status: 'error',
                code: 401,
                message: error.MISMATCHING_LOGIN,
            };
        }

        const passwordEqual = await bcrypt.compare(password, result.password);

        // If the sent over password matches the hashed password within the database, generate the
        // token and refreshToken JWT's . Also, update the 'last_login' timestamp and record
        // an entry for the user logging in into the system.
        if (passwordEqual) {
            const { token, refreshToken } = createTokens(result.id);

            return {
                status: 'ok',
                code: 200,
                data: {
                    user: User.project(result),
                    token,
                    refreshToken,
                },
            };
        }

        // password did not match the stored hashed password within the database
        return {
            status: 'error',
            code: 401,
            message: error.MISMATCHING_LOGIN,
        };
    },
});

export default router;
