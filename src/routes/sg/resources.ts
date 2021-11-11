import { z } from 'zod';
// import qs from 'query-string';
import express from 'express';
import registerRoute from '../../lib/requests';
// import User from '../../models/User';
// import { config } from '../../server';
// import Logger from '../../common/logger';
// import { IJwtSchema } from '../../validators/auth';
// import { makeRequest } from '../../utils/fetch';
// import { SgUserSchema } from '../../validators/sg';

const router = express.Router();

/**
 *
 */
registerRoute(router, '/import', {
    method: 'post',
    params: z.object({}),
    body: z.object({}),
    query: z.object({ from: z.string().url(), token: z.string(), state: z.string() }),
    permission: null,
    handler: async (_req, _res) => {},
});

/**
 *
 */
registerRoute(router, '/export/:id/metadata', {
    method: 'get',
    params: z.object({}),
    query: z.object({ from: z.string().url(), state: z.string() }),
    permission: null,
    handler: async (_req, _res) => {},
});

/**
 *
 */
registerRoute(router, '/export/:id', {
    method: 'get',
    params: z.object({}),
    query: z.object({ from: z.string().url(), state: z.string() }),
    permission: null,
    handler: async (_req, _res) => {},
});

export default router;
