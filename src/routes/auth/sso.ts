import { ZodError } from 'zod';
import bcrypt from 'bcryptjs';
import express from 'express';
import { createTokens } from '../../auth';

const router = express.Router();

router.post('/sso/login', async (req, res) => {
    throw new Error('Unimplemented');
});

router.post('/sso/verify', async (req, res) => {
    throw new Error('Unimplemented');
});

router.post('/sso/callback', async (req, res) => {
    throw new Error('Unimplemented');
});

export default router;
