import * as errors from '../../common/errors';
import Logger from '../../common/logger';
import { verifyPublicationPermission } from '../../lib/permissions';
import registerRoute from '../../lib/requests';
import Publication, { IPublication } from '../../models/Publication';
import Review, { IReviewStatus } from '../../models/Review';
import { IUser, IUserRole } from '../../models/User';
import * as userUtils from '../../utils/users';
import { ModeSchema } from '../../validators/requests';
import { IReviewCreationSchema } from '../../validators/reviews';
import express from 'express';
import { z } from 'zod';

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
    handler: async (req) => {
        const user = await userUtils.transformUsernameIntoId(req);

        const { name, revision } = req.params;

        // @@COWBUNGA

        const publication = await Publication.findOne({
            owner: user.id,
            name: name,
            revision: revision,
        });

        if (!publication) {
            return {
                status: 'error',
                code: 404,
                message: errors.RESOURCE_NOT_FOUND,
            };
        }

        const result = await Review.find({
            publication: publication.id,
            status: IReviewStatus.Completed,
        })
            .populate<{ publication: IPublication }>('publication')
            .populate<{ owner: IUser }>('owner')
            .exec();

        return {
            status: 'ok',
            code: 200,
            data: {
                reviews: await Promise.all(result.map(Review.project)),
            },
        };
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
    handler: async (req) => {
        const user = await userUtils.transformUsernameIntoId(req);

        const { name, revision } = req.params;

        // Verify that the publication exists...
        const publication = await Publication.findOne({
            owner: user.id,
            name: name.toLowerCase(),
            revision,
        })
            .exec();

        // Check that the publication isn't currently in draft mode...
        if (!publication || publication.draft) {
            return {
                status: 'error',
                code: 404,
                message: errors.RESOURCE_NOT_FOUND,
            };
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
            return {
                status: 'ok',
                code: 200,
                data: {
                    review: await Review.project(doc),
                },
            };
        }

        const newDoc = await new Review(docParams).save();

        const populated = await (
            await newDoc.populate<{ publication: IPublication }>('publication')
        ).populate<{ owner: IUser }>('owner');

        return {
            status: 'ok',
            code: 201,
            data: {
                review: await Review.project(populated),
            },
        };
    },
});

export default router;
