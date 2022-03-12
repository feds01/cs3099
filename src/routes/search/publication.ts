import express from 'express';
import { z } from 'zod';

import registerRoute from '../../lib/communication/requests';
import Publication, { AugmentedPublicationDocument } from '../../models/Publication';
import { PaginationQuerySchema } from '../../validators/pagination';

const router = express.Router({ mergeParams: true });

/**
 * @version v1.0.0
 * @method GET
 * @url /api/search/publication/
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/search/publication
 *
 * @description This endpoint will be used for searching publications that
 * are globally visible to the platform.
 */
registerRoute(router, '/', {
    method: 'get',
    params: z.object({}),
    query: z.object({ query: z.string() }).merge(PaginationQuerySchema),
    headers: z.object({}),
    permission: null,
    handler: async (req) => {
        const { query, take, skip } = req.query;

        type AggregationQuery = {
            data: AugmentedPublicationDocument[];
            total?: number;
        };

        // We set 'draft' to false since they aren't visible to the whole platform
        const aggregation = (await Publication.aggregate([
            { $match: { $text: { $search: query, $caseSensitive: false }, draft: false } },
            { $addFields: { score: { $meta: 'textScore' } } },
            {
                $facet: {
                    metadata: [
                        {
                            $group: {
                                _id: null,
                                total: { $sum: 1 },
                            },
                        },
                    ],
                    data: [
                        { $sort: { score: { $meta: 'textScore' } } },
                        { $skip: skip },
                        { $limit: take },
                    ],
                },
            },
            {
                $project: {
                    data: 1,
                    // Get total from the first element of the metadata array
                    total: { $arrayElemAt: ['$metadata.total', 0] },
                },
            },
        ])) as unknown as [AggregationQuery];

        const publications = aggregation[0];

        return {
            status: 'ok',
            code: 200,
            data: {
                publications: await Promise.all(
                    publications.data.map(async (pub) => await Publication.project(pub)),
                ),
                skip,
                take,
                total: publications.total ?? 0,
            },
        };
    },
});

export default router;
