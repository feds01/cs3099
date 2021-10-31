import express from 'express';

import { z } from 'zod';
import { IUserRole } from '../../models/User';
import {
    SearchQuerySchema,
} from '../../validators/publications';
import { registerRoute } from '../../wrappers/requests';


const router = express.Router({ mergeParams: true });

registerRoute(router, '/search', {
    method: 'get',
    params: z.object({}),
    query: SearchQuerySchema,
    permission: IUserRole.Default,
    handler: async (_req, res) => {
        // TODO: Implement search endpoint
        return res.status(200).json({
            status: true,
        });
    }
});


export default router;