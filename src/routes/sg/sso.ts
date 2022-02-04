import { z } from 'zod';
import qs from 'query-string';
import express from 'express';
import User from '../../models/User';
import { config } from '../../server';
import Logger from '../../common/logger';
import State from '../../models/State';
import registerRoute from '../../lib/requests';
import { IJwtSchema } from '../../validators/auth';
import { makeRequest } from '../../lib/fetch';
import { SgUserSchema } from '../../validators/sg';
import { createTokens, JwtError, verifyToken } from '../../lib/auth';
import { convertSgId, transformSgUserToInternal } from '../../transformers/sg';
import assert from 'assert';

const router = express.Router();

/**
 *
 */
registerRoute(router, '/login', {
    method: 'get',
    params: z.object({}),
    query: z.object({ from: z.string().url(), state: z.string() }),
    permission: null,
    handler: async (req, res) => {
        const { from, state } = req.query;

        // just forward the request with the query parameters to the frontend login endpoint.
        res.redirect(`${config.frontendURI}/login?from=${from}&state=${state}`); // @@TODO: use URL
    },
});

/**
 *
 */
registerRoute(router, '/callback', {
    method: 'get',
    params: z.object({}),
    query: z.object({ from: z.string().url(), state: z.string(), token: z.string() }),
    permission: null,
    handler: async (req, res) => {
        const { from, state, token } = req.query;
        Logger.info(`Processing request from: ${from} with state: ${state}`);

        // We need to verify that the state is correct with the transaction table...
        const stateLink = await State.findOne({ state }).exec();

        if (!stateLink) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid state.',
            });
        }

        // We also need to make a verify request to the from service
        const userData = await makeRequest(stateLink.from, '/api/sg/sso/verify', SgUserSchema, {
            query: { token },
            method: 'post',
        });

        if (userData.status === 'error') {
            return res.status(400).json({
                status: 'error',
                message: `request failed due to: ${userData.type}`,
                error: userData.errors || {},
            });
        }

        const { email, id } = userData.response;
        const transformedUser = transformSgUserToInternal(userData.response);

        // try to find the user
        const importedUser = await User.findOneAndUpdate(
            {
                email,
                externalId: convertSgId(id),
            },
            { $set: { ...transformedUser } },
            { upsert: true },
        ).exec();

        assert(importedUser !== null && typeof importedUser._id !== 'undefined');
        await State.findByIdAndDelete(stateLink.id).exec();

        // create the tokens
        const tokens = createTokens({
            id: importedUser._id,
            email: transformedUser.email,
            username: transformedUser.username,
        });
        const stringifiedTokens = qs.stringify(tokens);

        // Here we need to create or update the user and invalid the state so it can't be re-used.
        const path = new URL(
            `/auth/session?redirect=${stateLink.path}&${stringifiedTokens}`,
            config.frontendURI,
        );
        Logger.info(`Sending user back to: ${path.toString()}`);

        return res.redirect(path.toString());
    },
});

/**
 *
 */
registerRoute(router, '/verify', {
    method: 'post',
    params: z.object({}),
    body: z.object({}),
    query: z.object({ token: IJwtSchema }),
    permission: null,
    handler: async (req, res) => {
        const { token } = req.query;

        try {
            const verifiedToken = await verifyToken(token, config.jwtSecret);

            // now look up the user that's specified in the token.
            const user = await User.findById(verifiedToken.id).exec();

            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: "User doesn't exist.",
                });
            }
            return res.status(200).json({
                status: 'ok',
                id: `${user.id}:${config.teamName}`,
                ...User.projectAsSg(user),
            });
        } catch (e: unknown) {
            if (e instanceof JwtError) {
                // Specifically mention that the jwt has expired.
                if (e.type === 'expired') {
                    return res.status(401).json({
                        status: 'error',
                        message: 'JSON web token has expired.',
                    });
                }

                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid JSON web token.',
                });
            }

            Logger.error(e);
            return res.status(500).json({
                status: 'error',
                message: 'Internal Server Error',
            });
        }
    },
});

export default router;
