import { verifyUserPermission } from '../../lib/permissions';
import registerRoute from '../../lib/requests';
import { IPublication } from '../../models/Publication';
import Review, { IReviewStatus } from '../../models/Review';
import { IUser, IUserRole } from '../../models/User';
import * as userUtils from '../../utils/users';
import { ModeSchema } from '../../validators/requests';
import express from 'express';
import { z } from 'zod';

const router = express.Router();

/**
 * @version v1.0.0
 * @method GET
 * @url /api/users/:username/reviews
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/users/:username/reviews
 *
 * @description This endpoint is to list all of the reviews belonging to a user specified
 * the username.
 *
 */
registerRoute(router, '/:username/reviews', {
    method: 'get',
    params: z.object({ username: z.string() }),
    query: z.object({ mode: ModeSchema }),
    permissionVerification: verifyUserPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const user = await userUtils.transformUsernameIntoId(req);

        // We don't want to return all of the reviews if it isn't the owner. We
        // filter out un-completed reviews if the requester isn't the owner, but
        // we return all reviews if it is the owner.
        const isOwner = user.username === req.requester.username;

        const result = await Review.find({
            owner: user.id,
            ...(!isOwner && { status: IReviewStatus.Completed }),
        })
            .populate<{ owner: IUser }>('owner')
            .populate<{ publication: IPublication }>('publication')
            .exec();

        const reviews = await Promise.all(result.map(Review.project));

        return {
            status: 'ok',
            code: 200,
            data: {
                reviews,
            },
        };
    },
});

export default router;
