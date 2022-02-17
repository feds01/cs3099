import express from 'express';
import { z } from 'zod';

import registerRoute from '../../lib/requests';
import Publication from '../../models/Publication';
import { IUser } from '../../models/User';
import { PaginationQuerySchema } from '../../validators/requests';

const router = express.Router({ mergeParams: true });

/**
 * @version v1.0.0
 * @method GET
 * @url /api/publication/search
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication/search
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
            { score: { $meta: 'textScore' }, skip },
        )
            .sort({ score: { $meta: 'textScore' } })
            .populate<{ owner: IUser }>('owner')
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
