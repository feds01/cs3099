/**
 * src/common/error.js
 *
 * Module description:
 *
 * This module holds constant error messages which can be used through out the API service.
 * It contains generic error messages for bad requests, failed authentication, etc and API
 * specific error messages.
 */

interface ExpressError extends Error {
    status?: number;
}

export function isExpressError(err: unknown): err is ExpressError {
    return (
        err instanceof Error && err.hasOwnProperty('status') && typeof (err as { status?: unknown }).status === 'number'
    );
}

// User Accounts API request errors
export const USER_EXISTS = 'Username already in use.';
export const MAIL_EXISTS = 'Email already in use.';
export const MISMATCHING_LOGIN = "password or email fields incorrect/don't match.";
export const BAD_REQUEST = 'The API request is malformed or invalid';
export const UNAUTHORIZED = "User doesn't have permissions to perform this action.";
export const REGISTRATION_FAILED = 'Registration failed';
export const AUTHENTICATION_FAILED = 'Authentication failed';
export const NON_EXISTENT_USER = 'No user with the given username exists';

// General request errors
export const INTERNAL_SERVER_ERROR = 'Internal Server Error.';
