import { z } from 'zod';
import express from 'express';
import * as errors from '../../common/errors';
import * as userUtils from '../../utils/users';
import registerRoute from '../../lib/requests';
import { IUser, IUserRole } from '../../models/User';
import { ModeSchema } from '../../validators/requests';
import Review, { IReviewStatus } from '../../models/Review';
import Publication, { IPublication } from '../../models/Publication';

const router = express.Router();

/**
 *
 */
registerRoute(router, '/:username/:name/:revision/reviews', {
    method: 'get',
    params: z.object({ username: z.string(), name: z.string(), revision: z.string() }),
    query: z.object({ mode: ModeSchema }),
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        const { name, revision } = req.params;

        const publication = await Publication.findOne({
            owner: user.id,
            name: name,
            revision: revision,
        });

        if (!publication) {
            return res.status(404).json({
                status: false,
                message: errors.NON_EXISTENT_PUBLICATION,
            });
        }

        const result = await Review.find({
            publication: publication.id,
            status: IReviewStatus.Completed,
        })
            .populate<{ publication: IPublication }[]>('publication')
            .populate<{ owner: IUser }[]>('owner')
            .exec();

        const reviews = result.map((link) => Review.project(link as typeof result[number]));

        return res.status(200).json({
            status: true,
            reviews,
        });
    },
});

export default router;
