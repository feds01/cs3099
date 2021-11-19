import { z } from 'zod';
import express from 'express';
import Comment from '../../models/Comment';
import * as userUtils from '../../utils/users';
import registerRoute from '../../lib/requests';
import { IUser, IUserRole } from '../../models/User';
import { ModeSchema } from '../../validators/requests';
import Review, { IReviewStatus } from '../../models/Review';
import { IPublication } from '../../models/Publication';

const router = express.Router();

/**
 *
 */
registerRoute(router, '/:username/reviews', {
    method: 'get',
    params: z.object({ username: z.string() }),
    query: z.object({ mode: ModeSchema }),
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

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

        const reviews = await Promise.all(
            result.map(async (link) => await Review.project(link as typeof result[number])),
        );

        return res.status(200).json({
            status: true,
            reviews,
        });
    },
});

// TODO: Swagger docs for this endpoint, or is it even needed?
registerRoute(router, '/:username/comments', {
    method: 'get',
    params: z.object({ username: z.string() }),
    query: z.object({ mode: ModeSchema }),
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        // TODO: Filter comments on incomplete review
        const result = await Comment.find({ owner: user.id })
            .populate<{ owner: IUser }[]>('owner')
            .exec();

        const comments = result.map((link) => Comment.project(link as typeof result[number]));

        return res.status(200).json({
            status: true,
            comments,
        });
    },
});

export default router;
