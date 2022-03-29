import assert from 'assert';
import express from 'express';
import { z } from 'zod';

import { defaultPermissionVerifier } from '../../lib/communication/permissions';
import registerRoute from '../../lib/communication/requests';
import { IActivityOperationKind, IActivityType } from '../../models/Activity';
import Publication, { TransformedPublication } from '../../models/Publication';
import { IUserRole } from '../../models/User';
import { PublicationAggregation } from '../../types/aggregation';
import { PaginationQuerySchema } from '../../validators/pagination';
import { IPublicationCreationSchema } from '../../validators/publications';
import { FlagSchema } from '../../validators/requests';
import nameRouter from './byName';
import reviewRouter from './byName/reviews';

const router = express.Router();

router.use('/', reviewRouter);
router.use('/', nameRouter);

/**
 * @version v1.0.0
 * @method GET
 * @url /api/publication
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication/
 *
 * @description Route to list the most publications in a paginated form
 */
registerRoute(router, '/', {
    method: 'get',
    params: z.object({}),
    query: PaginationQuerySchema.merge(z.object({ current: FlagSchema.optional() })),
    headers: z.object({}),
    permission: { level: IUserRole.Default },
    permissionVerification: defaultPermissionVerifier,
    handler: async (req) => {
        const { skip, take, current } = req.query;

        const filterQuery = {
            draft: false,
            ...(typeof current !== 'undefined' && { current }),
        };

        // Separately count the number of publications that match the query since the aggregation will count the
        // total number of documents without applying the query.
        const total = await Publication.count(filterQuery).exec();

        const aggregation = (await Publication.aggregate([
            {
                $facet: {
                    data: [
                        {
                            $match: filterQuery,
                        },
                        { $sort: { _id: -1 } },
                        { $skip: skip },
                        { $limit: take },
                    ],
                },
            },
            {
                $project: { data: 1 },
            },
        ])) as unknown as [PublicationAggregation];

        const result = aggregation[0];

        return {
            status: 'ok',
            code: 200,
            data: {
                publications: await Promise.all(
                    result.data.map(async (publication) => await Publication.project(publication)),
                ),
                total,
                skip,
                take,
            },
        };
    },
});

/**
 * @version v1.0.0
 * @method POST
 * @url /api/publication
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication
 * >>> body:
 * {
 *   "name": "trinity",
 *   "revision": "v1",
 *   "title": "Test",
 *   "introduction": "Introduction here",
 *   "collaborators": ["user1", "user2"],
 * }
 *
 * @description Route to create a new publication entry in the database. The route
 * will prevent a creation of publications with the same name as ones that already
 * exist under the current user.
 */
registerRoute(router, '/', {
    method: 'post',
    params: z.object({}),
    body: IPublicationCreationSchema,
    query: z.object({}),
    headers: z.object({}),
    permission: { level: IUserRole.Default },
    activity: {
        kind: IActivityOperationKind.Create,
        type: IActivityType.Publication,
        permission: IUserRole.Default,
    },
    activityMetadataFn: async (
        _requester,
        request,
        response: { publication: TransformedPublication } | undefined,
    ) => {
        assert(typeof response !== 'undefined'); // if this fails, the activity will be discarded

        return {
            metadata: {
                collaborators: response.publication.collaborators?.length || 0,
                name: request.body?.name,
            },
            document: response.publication.id,
            liveness: false,
        };
    },
    permissionVerification: defaultPermissionVerifier,
    handler: async (req) => {
        const { name, collaborators } = req.body;
        const { id: owner } = req.requester;

        // Check if the publication is already in use...
        const existingPublication = await Publication.count({
            owner,
            name,
        }).exec();

        if (existingPublication > 0) {
            return {
                status: 'error',
                code: 400,
                message: 'Publication with the same name already exists',
                errors: {
                    name: {
                        message: 'Publication name already taken',
                    },
                },
            };
        }

        // @@Hack: Basically we have to verify again that the set has no null items since
        //         TypeScript can't be entirely sure if there are no nulls in the set.
        //         This is also partly due to the fact that zod cant't combine .transform()
        //         and .refine() functions yet...
        const publication = await new Publication({
            ...req.body,
            draft: true,
            current: true,
            collaborators: [...collaborators.values()].filter((c) => c !== null),
            owner,
        }).save();

        return {
            status: 'ok',
            code: 201,
            data: {
                publication: await Publication.projectWith(publication, req.requester),
            },
        };
    },
});

export default router;
