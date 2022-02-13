import { ZodError } from 'zod';

import { expr } from '../utils/expr';

export type ResponseError = {
    message: string;
};

export type ResponseErrorSummary = Record<string, ResponseError>;

/**
 *
 * @param error
 * @returns
 */
export function transformZodErrorIntoResponseError<T>(error: ZodError<T>): ResponseErrorSummary {
    const errorMap = new Map();

    error.errors.forEach((error) => {
        const path = error.path.join('.');

        // Perform some transformation on the ZodError to get into a more readable format
        const responseError = expr(() => {
            switch (error.code) {
                case 'invalid_type':
                    return {
                        message: `Expected to receive a '${error.expected}', but got '${error.received}'`,
                    };
                default:
                    return {
                        message: error.message,
                    };
            }
        });

        errorMap.set(path, responseError);

        return {
            message: error.message,
            path: error.path.map((item) => item.toString()),
        };
    });

    return Object.fromEntries(errorMap);
}
