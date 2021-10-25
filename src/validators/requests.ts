import * as express from 'express';
import { isValidObjectId } from 'mongoose';

import * as errors from '../common/errors';

/**
 * This is a middleware to make sure that when a certain request contains a user id,
 * it can be validated using this middleware, so that we can generalise this kind of
 * error handling. It is expected that the 'id' parameter follows the MongoDB convention
 *  of using a ObjectID which is a string of 24 hex characters.
 *
 * @param req - The current request object.
 * @param res - The response object.
 * @param next  - The next function callback, used to continue execution.
 */
export default function paramValidator(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
) {
    const { id } = req.params;

    // TODO: In the future, we can use zod to provide general schemas for each point and the checker
    // can just use the schema instead of only checking the 'id' parameter, and lifting the constraint
    // of the 'id' field being named as it is.
    if (!isValidObjectId(id)) {
        return res.status(400).json({
            status: false,
            message: errors.BAD_REQUEST,
            extra: 'Invalid user id format.',
        });
    }

    next();
}
