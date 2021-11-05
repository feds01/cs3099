import express from 'express';
import { z } from 'zod';
import registerRoute from '../../lib/requests';
import { IUserRole } from '../../models/User';
import { IJwtSchema } from '../../validators/auth';
// import { createTokens } from '../../wrappers/auth';

const router = express.Router();

router.post('/sso/login', async (_req, _res) => {
    throw new Error('Unimplemented');
});

router.post('/sso/verify', async (_req, _res) => {
    throw new Error('Unimplemented');
});

registerRoute(router, "/sso/verify", {
    method: "post",
    params: z.object({}),
    query: z.object({token: IJwtSchema}),
    body: z.object({}),
    permission: null,
    handler: async (req, res) => {
        // req.requester.
    }
});

router.post('/sso/callback', async (_req, _res) => {
    throw new Error('Unimplemented');
});

export default router;
