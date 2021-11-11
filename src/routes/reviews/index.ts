import { z } from 'zod';
import express from 'express';
import * as error from '../../common/errors';
import registerRoute from '../../lib/requests';
import { IUserRole } from '../../models/User';
import Comment from '../../models/Comment';
import Review, { IReviewStatus } from '../../models/Review';
import { ObjectIdSchema } from '../../validators/requests';

const router = express.Router();

/**
 *
 */
registerRoute(router, '/review/:id/complete', {
    method: 'patch',
    body: z.object({}),
    query: z.object({}),
    params: z.object({ id: ObjectIdSchema }),
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const { id } = req.params;
        const { id: ownerId } = req.requester;

        const review = await Review.findById(id).exec();

        // verify that the review exists and the owner is trying to publish it...
        if (!review || review.owner.toString() !== ownerId) {
            return res.status(404).json({
                status: 'error',
                message: error.NON_EXISTENT_REVIEW,
            });
        }

        await review.update({ $set: { status: IReviewStatus.Completed } }).exec();

        return res.status(200).json({
            status: 'ok',
            message: 'Marked the review as complete.',
        });
    },
});

/**
 *
 */
registerRoute(router, '/review/:id', {
    method: 'get',
    query: z.object({}),
    params: z.object({ id: ObjectIdSchema }),
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const { id } = req.params;
        const { id: ownerId } = req.requester;

        const review = await Review.findById(id).exec();

        // verify that the review exists and the owner is trying to publish it...
        if (!review || review.owner.toString() !== ownerId) {
            return res.status(404).json({
                status: 'error',
                message: error.NON_EXISTENT_REVIEW,
            });
        }

        return res.status(200).json({
            status: 'ok',
            review: Review.project(review),
        });
    },
});

/**
 *
 */
registerRoute(router, '/review/:id', {
    method: 'delete',
    query: z.object({}),
    params: z.object({ id: ObjectIdSchema }),
    permission: IUserRole.Administrator,
    handler: async (req, res) => {
        const { id } = req.params;

        // Delete the entire review and delete all the comments on the review...
        const review = await Review.findByIdAndDelete(id).exec();

        if (!review) {
            return res.status(404).json({
                status: 'error',
                message: error.NON_EXISTENT_REVIEW,
            });
        }

        await Comment.deleteMany({ review: review.id }).exec();

        return res.status(200).json({
            status: 'ok',
            message: 'Review is deleted.',
        });
    },
});

export default router;
