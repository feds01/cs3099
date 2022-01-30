import { z } from 'zod';
import express from 'express';
import Logger from '../../common/logger';
import * as errors from '../../common/errors';
import * as userUtils from '../../utils/users';
import registerRoute from '../../lib/requests';
import { IUser, IUserRole } from '../../models/User';
import { ModeSchema } from '../../validators/requests';
import Review, { IReviewStatus } from '../../models/Review';
import Publication, { IPublication } from '../../models/Publication';
import { IReviewCreationSchema } from '../../validators/reviews';
import assert from 'assert';

const router = express.Router();

/**
 *
 */
registerRoute(router, '/:username/:name/:revision/reviews', {
    method: 'get',
    params: z.object({ username: z.string(), name: z.string(), revision: z.string() }),
    query: z.object({ mode: ModeSchema }),
    permission: { kind: 'review', level: IUserRole.Default },
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

        const reviews = await Promise.all(
            result.map(async (link) => await Review.project(link as typeof result[number])),
        );

        return res.status(200).json({
            status: true,
            reviews,
        });
    },
});

/**
 *
 */
registerRoute(router, '/:username/:name/:revision/review', {
    method: 'post',
    body: IReviewCreationSchema,
    query: z.object({ mode: ModeSchema }),
    params: z.object({
        username: z.string(),
        name: z.string(),
        revision: z.string(),
    }),
    permission: { kind: 'review', level: IUserRole.Default },
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        const { name, revision } = req.params;

        // Verify that the publication exists...
        const publication = await Publication.findOne({
            owner: user.id,
            name: name.toLowerCase(),
            revision,
        })
            .sort({ _id: -1 })
            .exec();

        // Check that the publication isn't currently in draft mode...
        if (!publication || publication.draft) {
            return res.status(404).json({
                status: 'error',
                message: errors.NON_EXISTENT_PUBLICATION,
            });
        }

        // Now attempt to create the new review
        const docParams = {
            publication: publication.id,
            owner: req.requester.id,
            status: IReviewStatus.Started,
        };

        const doc = await Review.findOne(docParams)
            .populate<{ publication: IPublication }>('publication')
            .populate<{ owner: IUser }>('owner')
            .exec();

        // If the user tries to creat ea new review whilst another pending review exists, that review
        // is returned instead of making a new review...
        if (doc) {
            Logger.info('Using pre-created review for user instead of creating a new one...');
            return res.status(200).json({
                status: 'ok',
                message: 'Successfully initialised review.',
                review: await Review.project(doc),
            });
        }

        try {
            const newDoc = await new Review(docParams).save();

            // @@HACK: We should be able to modify the returned doc and project it.
            // populate the fields in the new document so that it can be projected...
            const projected = await Review.findById(newDoc._id)
                .populate<{ publication: IPublication }>('publication')
                .populate<{ owner: IUser }>('owner')
                .exec();

            // @@Cleanup!
            assert(projected);

            return res.status(200).json({
                status: 'ok',
                message: 'Successfully initialised review.',
                review: await Review.project(projected),
            });
        } catch (e: unknown) {
            Logger.error(e);

            return res.status(500).json({
                status: 'error',
                message: errors.INTERNAL_SERVER_ERROR,
            });
        }
    },
});

export default router;
