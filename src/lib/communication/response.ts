import express from 'express';

import * as errors from '../../common/errors';
import { ResponseErrorSummary } from '../../transformers/error';
import ActivityRecord from '../activity';

/** Type represents the return type of any request handler */
export type ApiResponse<T> =
    /** Request was successful */
    | {
          status: 'ok';
          code: 200 | 201 | 204;
          data?: T;
      }
    /** Request was overall successful, but it encountered 'recoverable' errors */
    | {
          status: 'partial';
          code: 207;
          data?: T;
          errors?: ResponseErrorSummary;
      }
    /** Request failed with some 4XX or 5XX error code */
    | {
          status: 'error';
          code: 400 | 401 | 404 | 500 | 503;
          message: string;
          errors?: ResponseErrorSummary;
      }
    /** Request prompts for a redirect, status code 301 */
    | {
          status: 'redirect';
          url: string;
      }
    /** Request was successful, but handler will send a file */
    | {
          status: 'file';
          code: 200;
          /** The path of the file that is to be sent to the server */
          file: string;
      };

/**
 * Function that handles the returned endpoint from a response and makes a call to the express
 * API to make a response
 *
 * @param res - The express response object that can be used to communicate with express.
 * @param response - The response from the request handler
 */
export async function handleResponse<T, P, Q, B>(
    res: express.Response,
    response: ApiResponse<T>,
    activity: ActivityRecord<P, Q, B> | null,
): Promise<void> {
    // Save the activity if it's valid and the requestHandler returned an non-error status
    if (response.status !== 'error' && activity?.isValid) {
        await activity.save();
    }

    switch (response.status) {
        case 'ok':
            res.status(response.code).json({
                status: 'ok',
                ...response.data,
            });
            return;
        case 'partial':
            // Partial status signals that the response did succeed, but it there were some
            // errors so not all of the parameters/expectations of the request may of succeeded.
            // This is only really used when importing reviews, because some reviews might fail
            // because we can't query foreign users, or comment data doesn't make sense... etc.
            res.status(response.code).json({
                status: 'ok',
                ...(response.errors && { errors: response.errors }),
                ...response.data,
            });
            return;
        case 'error': {
            // If the activity was found to be valid, but the request failed for whatever reason, we can
            // remove the recorded event as it does not apply...
            if (activity?.isValid) {
                await activity.discard();
            }

            res.status(response.code).json({
                status: 'error',
                message: response.message,
                ...(response.errors && { errors: response.errors }),
            });
            return;
        }
        case 'redirect': {
            res.redirect(response.url);
            return;
        }
        case 'file': {
            res.status(response.code).sendFile(response.file);
            return;
        }
        default: {
            throw new errors.ApiError(500, errors.INTERNAL_SERVER_ERROR);
        }
    }
}
