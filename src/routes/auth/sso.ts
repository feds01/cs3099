// import { ZodError } from 'zod';
// import bcrypt from 'bcryptjs';
import express from 'express';
// import { createTokens } from '../../wrappers/auth';

const router = express.Router();

router.post('/sso/login', async (_req, _res) => {
    throw new Error('Unimplemented');
});

router.post('/sso/verify', async (_req, _res) => {
    throw new Error('Unimplemented');
});

router.post('/sso/callback', async (_req, _res) => {
    throw new Error('Unimplemented');
});

export default router;
