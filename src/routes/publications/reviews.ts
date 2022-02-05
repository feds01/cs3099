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
import { verifyPublicationPermission } from '../../lib/permissions';

const router = express.Router();

/**
 * @version v1.0.0
 * @method GET
 * @url /api/publication/:username/:name/:revision/reviews
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication/feds01/zap/v1/reviews
 *
 * @description This endpoint is used to list all of the reviews on a specific publication
 * which is specified by the owner's username, publication name and publication revision.
 *
 */
registerRoute(router, '/:username/:name/:revision/reviews', {
    method: 'get',
    params: z.object({ username: z.string(), name: z.string(), revision: z.string() }),
    query: z.object({ mode: ModeSchema }),
    permissionVerification: verifyPublicationPermission,
    permission: { level: IUserRole.Default },
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
            .populate<{ publication: IPublication }>('publication')
            .populate<{ owner: IUser }>('owner')
            .exec();

        const reviews = await Promise.all(result.map(async (link) => await Review.project(link)));

        return res.status(200).json({
            status: true,
            reviews,
        });
    },
});

/**
 * @version v1.0.0
 * @method POST
 * @url /api/publication/:username/:name/:revision/review
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication/feds01/zap/v1/review
 *
 * @description This endpoint is used to initiate the process of reviewing a publication.
 * It sets up the necessary information in the database for a review of a publication to start.
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
    permissionVerification: verifyPublicationPermission,
    permission: { level: IUserRole.Default },
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

            const populated = await (
                await newDoc.populate<{ publication: IPublication }>('publication')
            ).populate<{ owner: IUser }>('owner');

            return res.status(201).json({
                status: 'ok',
                message: 'Successfully initialised review.',
                review: await Review.project(populated),
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
