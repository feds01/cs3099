import express from 'express';

import { z } from 'zod';
import { IUserRole } from '../../models/User';
import registerRoute from '../../lib/requests';

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
    query: z.object({}),
    permission: { level: IUserRole.Default },
    handler: async (_req) => {
        // TODO: Implement search endpoint
        return {
            status: 'error',
            code: 503,
            message: 'Service Unavailable',
        };
    },
});

export default router;
