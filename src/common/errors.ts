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
export const MISMATCHING_LOGIN = "password or email fields incorrect/don't match.";
export const NON_EXISTENT_USER = 'No user with the given username or id exists';

// General request errors
export const UNAUTHORIZED = "User doesn't have permissions to perform this action.";
export const BAD_REQUEST = 'The API request is malformed or invalid';
export const RESOURCE_NOT_FOUND = 'Resource could not be found.';
export const INTERNAL_SERVER_ERROR = 'Internal Server Error.';

// Error codes map for specific cases
export const CODES = {
    PUBLICATION_ARCHIVE_EXISTS: 100,
};
