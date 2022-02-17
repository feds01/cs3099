import express from 'express';
import { z } from 'zod';

import registerRoute from '../../lib/requests';
import User from '../../models/User';
import { PaginationQuerySchema } from '../../validators/requests';

const router = express.Router();

/**
 * @version v1.0.0
 * @method GET
 * @url /api/user/search
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/user/search
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

        const users = await User.find(
            { $text: { $search: query } },
            { score: { $meta: 'textScore' }, skip },
        )
            .sort({ score: { $meta: 'textScore' } })
            .limit(take)
            .exec();

        return {
            status: 'ok',
            code: 200,
            data: {
                users: users.map((user) => User.project(user)),
            },
        };
    },
});

export default router;
