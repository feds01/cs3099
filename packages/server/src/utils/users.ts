import * as errors from '../common/errors';
import User, { AugmentedUserDocument } from '../models/User';
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
): Promise<AugmentedUserDocument> {
    const { mode } = req.query;
    const { username } = req.params;

    let user: AugmentedUserDocument | null = null;

    if (mode === 'username' || typeof mode === 'undefined') {
        user = await User.findOne({ username });
    } else {
        // We need to first validate that the 'username' parameter is a mongoose
        const userId = ObjectIdSchema.safeParse(username);

        if (!userId.success) {
            throw new errors.ApiError(400, errors.BAD_REQUEST);
        }

        user = await User.findById(userId.data);
    }

    if (!user) {
        throw new errors.ApiError(404, errors.NON_EXISTENT_USER);
    }

    return user;
}
