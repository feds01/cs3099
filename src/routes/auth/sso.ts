import { z } from 'zod';
import qs from 'query-string';
import express from 'express';
import User from '../../models/User';
import { config } from '../../server';
import Logger from '../../common/logger';
import registerRoute from '../../lib/requests';
import { IJwtSchema } from '../../validators/auth';
import { createTokens, JwtError, verifyToken } from '../../lib/auth';
import State from '../../models/State';
import { makeRequest } from '../../utils/fetch';
import { SgUserSchema } from '../../validators/sg';
import { transformSgUserToInternal } from '../../transformers/sg';

const router = express.Router();

registerRoute(router, '/sso/login', {
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

registerRoute(router, '/sso/callback', {
    method: 'post',
    params: z.object({}),
    query: z.object({ from: z.string().url(), state: z.string(), token: z.string() }),
    body: z.object({}),
    permission: null,
    handler: async (req, res) => {
        const { from, state, token } = req.query;

        // We need to verify that the state is correct with the transaction table...
        const stateLink = await State.findOne({ from, state }).exec();

        if (!stateLink) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid state.',
            });
        }

        // We also need to make a verify request to the from service
        const response = await makeRequest(stateLink.from, '/api/sg/sso/verify', SgUserSchema, {
            query: { token },
        });

        if (response.status === 'error') {
            return res.status(400).json({
                status: 'error',
                message: `request failed due to: ${response.type}`,
            });
        }

        const { data } = response;

        // try to find the user
        const externalUser = await User.findOne({
            email: data.email,
            externalId: `${data.id.id}:${data.id.group}`,
        }).exec();
        const transformedUser = transformSgUserToInternal(data);

        let id;

        if (!externalUser) {
            // we need to create the new user...
            const doc = new User(transformedUser);
            await doc.save();

            id = doc.id;
        } else {
            await User.findByIdAndUpdate(externalUser.id, transformedUser, {}).exec();
            id = externalUser.id;
        }

        // create the tokens
        const tokens = createTokens({
            id,
            email: transformedUser.email,
            username: transformedUser.username,
        });
        const stringifiedTokens = qs.stringify(tokens);

        // Here we need to create or update the user and invalid the state so it can't be re-used.
        const path = new URL(
            `/auth/session?redirect=${stateLink.path}&${stringifiedTokens}`,
            config.frontendURI,
        );
        return res.redirect(path.toString());
    },
});

registerRoute(router, '/sso/verify', {
    method: 'post',
    params: z.object({}),
    query: z.object({ token: IJwtSchema }),
    body: z.object({}),
    permission: null,
    handler: async (req, res) => {
        const { token } = req.query;

        try {
            const verifiedToken = await verifyToken(token);

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
                user_id: `${user.id}:${config.teamName}`,
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
