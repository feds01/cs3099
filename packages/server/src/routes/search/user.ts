import express from 'express';
import { z } from 'zod';

import registerRoute from '../../lib/communication/requests';
import User, { IUserDocument } from '../../models/User';
import { PaginationQuerySchema } from '../../validators/pagination';

const router = express.Router();

/**
 * @version v1.0.0
 * @method GET
 * @url /api/search/user
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/search/user
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
    permissionVerification: undefined,
    handler: async (req) => {
        const { query, skip, take } = req.query;

        type AggregationQuery = {
            data: IUserDocument[];
            total?: number;
        };

        const aggregation = (await User.aggregate([
            { $match: { $text: { $search: query } } },
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

        const users = aggregation[0];

        return {
            status: 'ok',
            code: 200,
            data: {
                users: users.data.map((user) => User.project(user)),
                skip,
                take,
                total: users.total ?? 0,
            },
        };
    },
});

export default router;
