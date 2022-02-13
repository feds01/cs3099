import express from 'express';

import { ResponseErrorSummary } from '../transformers/error';

export type ApiResponse<T> =
    | {
          status: 'ok';
          code: 200 | 201 | 204;
          data?: T;
      }
    | {
          status: 'error';
          code: 400 | 401 | 404 | 500 | 503;
          message: string;
          errors?: ResponseErrorSummary;
      }
    | {
          status: 'redirect';
          url: string;
      }
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
 * @param res
 * @param response
 */
export function handleResponse<T>(res: express.Response, response: ApiResponse<T>): void {
    switch (response.status) {
        case 'ok':
            res.status(response.code).json({
                status: 'ok',
                ...response.data,
            });
            return;
        case 'error': {
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
    }
}
