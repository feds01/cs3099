import { z } from 'zod';
import express from 'express';
import * as errors from '../../common/errors';
import Publication from '../../models/Publication';
import Review, { IReviewStatus } from '../../models/Review';
import * as userUtils from '../../utils/users';
import registerRoute from '../../lib/requests';
import { IUserRole } from '../../models/User';
import { ModeSchema } from '../../validators/requests';

const router = express.Router();

registerRoute(router, '/:username/:name/reviews', {
    method: 'get',
    params: z.object({ username: z.string(), name: z.string() }),
    query: z.object({ mode: ModeSchema }),
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        const { name } = req.params;

        // TODO: may involve filtering by revision
        const publications = await Publication.find({
            owner: user.id,
            name,
        });

        const reviews = await Review.find({
            publication: { $in: publications.map((p) => p.id) },
            status: IReviewStatus.Completed,
        });
        if (!reviews) {
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
