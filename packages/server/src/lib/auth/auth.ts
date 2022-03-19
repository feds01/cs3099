/**
 * src/auth.ts
 *
 * Module description:
 * This module holds all the authentication tools that the API uses. The module
 * has methods to generate and refresh JWT tokens and the two methods for authenticating
 * User Accounts API requests and Documents API requests.
 *
 */
import express from 'express';
import jwt, { JwtPayload, TokenExpiredError } from 'jsonwebtoken';

import { ApiError } from '../../common/errors';
import { config } from '../../server';
import { IAuthHeaderSchema } from '../../validators/auth';
import { TokenSchema, VerifiedToken } from '../../validators/token';

export interface TokenPayload {
    token: string;
    refreshToken: string;
}

export interface TokenData {
    id: string;
}

/**
 * Function that is used to verify the validity of a token.
 *
 * @param token - The token to verify
 * @returns The token payload if the token is valid, throws an error if the token is invalid.
 */
export async function verifyToken(token: string, secret: string): Promise<VerifiedToken> {
    try {
        const payload = jwt.verify(token, secret, {});
        return TokenSchema.parse(payload);
    } catch (err: unknown) {
        if (err instanceof TokenExpiredError) {
            throw new ApiError(401, 'Token expired');
        }

        throw new ApiError(401, 'unknown');
    }
}

/**
 * This function will generate two JWT tokens from a user's username and UUID. This
 * information is packed into the token to be later used for authentication. The method
 * creates a 'token' and 'refresh-token' for usage. The token is signed using the secret
 * 'JWT_SECRET_KEY' whereas the 'refresh-token' is signed using the 'JWT_REFRESH_SECRET_KEY'
 * which differ in values.
 *
 * @param {string} id - The subject id of the token
 * @param {Object} payload: string representing the user's email
 * @returns an object comprised of the token and refresh token.
 * */
export const createTokens = <T>(id: string, payload?: T): TokenPayload => {
    const token = jwt.sign({ sub: id, data: payload }, config.jwtSecret, {
        expiresIn: config.jwtExpiry,
    });

    // sign the refresh-token
    const refreshToken = jwt.sign({ sub: id }, config.jwtRefreshSecret, {
        expiresIn: config.jwtRefreshExpiry,
    });

    // return the tokens as a resolved promise
    return { token, refreshToken };
};

/**
 * This method is used to refresh the tokens on a authentication request. It will use
 * the 'x-refresh-token' in the request header to attempt to verify the request. If the
 * refresh token isn't stale (out of date) the method will use createTokens() function
 * to generate two new tokens and it will return them. The method also returns data on
 * the user so that can be associated with the 'req.token' in getToken().
 *
 * @param {String} refreshToken: JWT refresh token in string form used to authorise a refresh
 *        of the access tokens.
 * @returns {Object} The object contains the new token, new refresh token and the decoded user data
 * @error if the refreshToken is stale, the method will return an empty object.
 * */
export function refreshTokens(refreshToken: string): TokenPayload {
    const decodedToken = jwt.verify(refreshToken, config.jwtRefreshSecret) as JwtPayload;

    // Is this even required?
    if (typeof decodedToken.sub === 'undefined') {
        throw new ApiError(401, 'Invalid token');
    }

    // generate new token values to replace old token's with refreshed ones.
    return createTokens(decodedToken.sub);
}

/**
 * A utility function to unpack the passed over authentication token. It will attempt
 * to decode the token which is meant to be located within the request header. It will try
 * to unpack the contents into an object under the namespace 'user_data'. So, the data from
 * the token is accessible by using 'req.token'.
 */
export async function getTokensFromHeader(
    req: express.Request,
    res: express.Response,
): Promise<VerifiedToken> {
    const bearer = req.get('Authorization');
    const refreshToken = req.get('x-refresh-token');

    try {
        const token = IAuthHeaderSchema.parse(bearer);

        // Decode the sent over JWT key using our secret key stored in the process' runtime.
        // Then carry on, even if the data is incorrect for the given request, since this does
        // not interpret the validity of the request.
        return await verifyToken(token, config.jwtSecret);
    } catch (e: unknown) {
        if (typeof refreshToken !== 'string') {
            throw new ApiError(
                401,
                "Couldn't refresh stale token as no refresh token is provided.",
            );
        }

        const newTokens = refreshTokens(refreshToken);

        // if new tokens were provided, update the access and refresh tokens
        res.set('Access-Control-Expose-Headers', 'x-token, x-refresh-token');
        res.set('x-token', newTokens.token);
        res.set('x-refresh-token', newTokens.refreshToken);

        // pass on the metadata which was decoded from the JWT
        return await verifyToken(newTokens.token, config.jwtSecret);
    }
}
