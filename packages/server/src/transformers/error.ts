import { ZodError } from 'zod';

import { expr } from '../utils/expr';

export interface ResponseError {
    message: string | string[];
    code?: number;
}

export type ResponseErrorSummary = Record<string, ResponseError>;

/**
 * Function that is used to transform @see ZodError that are returned from any
 * failed @see ZodSchema are transformed into an internal error subject
 *
 * @param error - Any ZodError from a schema
 * @returns A transformed readable error map
 */
export function transformZodErrorIntoResponseError<T>(error: ZodError<T>): ResponseErrorSummary {
    const errorMap = new Map();

    error.errors.forEach((errorItem) => {
        const path = errorItem.path.join('.');

        // Perform some transformation on the ZodError to get into a more readable format
        const responseError = expr(() => {
            switch (errorItem.code) {
                case 'invalid_type':
                    return {
                        message: `Expected to receive a '${errorItem.expected}', but got '${errorItem.received}'`,
                    };
                default:
                    return {
                        message: errorItem.message,
                    };
            }
        });

        errorMap.set(path, responseError);

        return {
            message: error.message,
            path: errorItem.path.map((item) => item.toString()),
        };
    });

    return Object.fromEntries(errorMap) as ResponseErrorSummary;
}
