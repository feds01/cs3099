import express from 'express';
import User, { IUserDocument } from '../models/User';
import * as errors from '../common/errors';
import { ObjectIdSchema, UserRequestMode } from '../validators/requests';

export interface RequestParameters<P, Q> {
    params: P;
    query: Q;
}

interface UsernameReq {
    username: string;
}

interface UsernameQueryReq {
    mode?: UserRequestMode;
}

/**
 *
 * @param req - Object which contains the parsed and validated request body, query and params
 * @param res - Express response object to send requests to
 * @returns
 */
export async function transformUsernameIntoId<P extends UsernameReq, Q extends UsernameQueryReq>(
    req: RequestParameters<P, Q>,
    res: express.Response,
): Promise<IUserDocument | null> {
    const { mode } = req.query;
    const { username } = req.params;

    let user;
    if (mode === 'username' || typeof mode === 'undefined') {
        user = await User.findOne({ username });
    } else {
        // We need to first validate that the 'username' parameter is a mongoose
        const userId = ObjectIdSchema.safeParse(username);

        if (!userId.success) {
            res.status(400).json({
                status: false,
                message: errors.BAD_REQUEST,
            });
            return null;
        }

        user = await User.findById(userId.data);
    }

    if (!user) {
        res.status(404).json({
            status: false,
            message: errors.NON_EXISTENT_USER,
        });
        return null;
    }

    return user;
}
