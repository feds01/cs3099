import express from 'express';

import { z } from 'zod';
import { IUserRole } from '../../models/User';
import { SearchQuerySchema } from '../../validators/publications';
import registerRoute from '../../lib/requests';

const router = express.Router({ mergeParams: true });

/**
 *
 */
registerRoute(router, '/search', {
    method: 'get',
    params: z.object({}),
    query: SearchQuerySchema,
    permission: IUserRole.Default,
    handler: async (_req, res) => {
        // TODO: Implement search endpoint
        return res.status(503).json({
            status: 'error',
            message: 'Service Unavailable',
        });
    },
});

export default router;
