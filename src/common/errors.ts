/**
 * src/common/error.js
 *
 * Module description:
 *
 * This module holds constant error messages which can be used through out the API service.
 * It contains generic error messages for bad requests, failed authentication, etc and API
 * specific error messages.
 */

import { ResponseErrorSummary } from '../transformers/error';

interface ExpressError extends Error {
    status?: number;
}

export function isExpressError(err: unknown): err is ExpressError {
    return (
        err instanceof Error &&
        'status' in err &&
        typeof (err as { status?: unknown }).status === 'number'
    );
}

export class ApiError extends Error {
    readonly code: number;
    readonly errors?: ResponseErrorSummary;

    constructor(code: number, message: string, errors?: ResponseErrorSummary) {
        super(message);

        this.code = code;
        this.errors = errors;
    }
}

// User Accounts API request errors
export const USER_EXISTS = 'Username already in use.';
export const MAIL_EXISTS = 'Email already in use.';
export const MISMATCHING_LOGIN = "password or email fields incorrect/don't match.";
export const BAD_REQUEST = 'The API request is malformed or invalid';
export const UNAUTHORIZED = "User doesn't have permissions to perform this action.";
export const REGISTRATION_FAILED = 'Registration failed';
export const AUTHENTICATION_FAILED = 'Authentication failed';
export const NON_EXISTENT_USER = 'No user with the given username or id exists';

// Follow endpoints
export const SELF_FOLLOWING = 'Users cannot follow themselves';
export const ALREADY_FOLLOWED = 'The user is already followed by you';

// Publications endpoints
export const PUBLICATION_FAILED = 'Upload publication failed';
export const PUBLICATION_EXISTS = 'Publication with the same name already exists÷';
export const NON_EXISTENT_PUBLICATION = 'No publication with the given keyword exists';
export const NON_EXISTENT_PUBLICATION_ID = 'No publication with the given id exists';

// Review endpoints
export const NON_EXISTENT_REVIEW = 'No review was found';

// Comment endpoints
export const NON_EXISTENT_COMMENT = 'No comment was found';
export const NON_EXISTENT_THREAD = 'No thread with the given id exists';

// General request errors
export const RESOURCE_NOT_FOUND = 'Resource could not be found.';
export const INTERNAL_SERVER_ERROR = 'Internal Server Error.';
