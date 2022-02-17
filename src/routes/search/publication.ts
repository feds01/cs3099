import express from 'express';
import { z } from 'zod';

import registerRoute from '../../lib/requests';
import Publication from '../../models/Publication';
import { IUser } from '../../models/User';
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
registerRoute(router, '/search', {
    method: 'get',
    params: z.object({}),
    query: z.object({ query: z.string() }).merge(PaginationQuerySchema),
    permission: null,
    handler: async (req) => {
        const { query, take, skip } = req.query;

        const publications = await Publication.find(
            { $text: { $search: query } },
            { score: { $meta: 'textScore' } },
        )
            .sort({ score: { $meta: 'textScore' } })
            .populate<{ owner: IUser }>('owner')
            .skip(skip)
            .limit(take)
            .exec();

        return {
            status: 'ok',
            code: 200,
            data: {
                publications: await Promise.all(
                    publications.map(async (pub) => await Publication.project(pub)),
                ),
            },
        };
    },
});

export default router;
