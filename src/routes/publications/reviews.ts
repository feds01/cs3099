import { z } from 'zod';
import express from 'express';
import * as errors from '../../common/errors';
import Publication, { IPublication } from '../../models/Publication';
import Review, { IReviewStatus } from '../../models/Review';
import * as userUtils from '../../utils/users';
import registerRoute from '../../lib/requests';
import { IUser, IUserRole } from '../../models/User';
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
        const publication = await Publication.findOne({
            owner: user.id,
            name: name,
            current: true,
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
