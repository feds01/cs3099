import { z } from 'zod';
import express from 'express';
import * as errors from '../../common/errors';
import Review, { IReviewStatus } from '../../models/Review';
import Comment from '../../models/Comment';
import * as userUtils from '../../utils/users';
import registerRoute from '../../lib/requests';
import { IUserRole } from '../../models/User';
import { ModeSchema } from '../../validators/requests';

const router = express.Router({ mergeParams: true });

registerRoute(router, '/:username/reviews', {
    method: 'get',
    params: z.object({ username: z.string() }),
    query: z.object({ mode: ModeSchema }),
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        const reviews = await Review.find({ owner: user.id, status: IReviewStatus.Completed });
        if (reviews.length === 0) {
            return res.status(404).json({
                status: false,
                message: errors.NON_EXISTENT_REVIEW,
            });
        }
        return res.status(200).json({
            status: true,
            reviews,
        });
    },
});

registerRoute(router, '/:username/comments', {
    method: 'get',
    params: z.object({ username: z.string() }),
    query: z.object({ mode: ModeSchema }),
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        // TODO: Filter comments on incomplete review
        const comments = await Comment.find({ owner: user.id });
        if (comments.length === 0) {
            return res.status(404).json({
                status: false,
                message: errors.NON_EXISTENT_COMMENT,
            });
        }
        return res.status(200).json({
            status: true,
            comments,
        });
    },
});

export default router;
