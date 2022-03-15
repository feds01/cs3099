import assert from 'assert';
import express from 'express';
import qs from 'query-string';
import { z } from 'zod';

import Logger from '../../common/logger';
import { createTokens, verifyToken } from '../../lib/auth/auth';
import { makeRequest } from '../../lib/communication/fetch';
import registerRoute from '../../lib/communication/requests';
import State from '../../models/State';
import User from '../../models/User';
import { config } from '../../server';
import { convertSgId, transformSgUserToInternal } from '../../transformers/sg';
import { expr } from '../../utils/expr';
import { IJwtSchema } from '../../validators/auth';
import { SgUserSchema } from '../../validators/sg';

const router = express.Router();

/**
 * @version v1.0.0
 * @method GET
 * @url /api/sg/sso/login
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/sg/sso/login
 *
 *
 * @description This route is used to initiate the sso authentication process between our service
 * and an external service. This endpoint essentially acts as a forefront for redirecting external
 * requesters to our login portal from where we can authenticate the user and redirect the back
 * to the '/callback' endpoint defined in the external service.
 *
 * @see https://app.swaggerhub.com/apis/feds01/supergroup-c_api/1.0.0#/authentication/get_api_sg_sso_login
 * */
registerRoute(router, '/login', {
    method: 'get',
    params: z.object({}),
    query: z.object({ from: z.string().url(), state: z.string() }),
    headers: z.object({}),
    permission: null,
    handler: async (req) => {
        const { from, state } = req.query;

        // just forward the request with the query parameters to the frontend login endpoint.
        return {
            status: 'redirect',
            url: `${config.frontendURI}/login?from=${from}&state=${state}`,
        };
    },
});

/**
 * @version v1.0.0
 * @method POST
 * @url /api/sg/sso/callback
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/sg/sso/login
 *
 *
 * @description This route is used to handle the response from the external service when they
 * have replied with the authentication status. The external service will invoke this endpoint
 * and provide information about the logged in user. In here, we essentially create or update
 * the user from the details that we receive from the '/verify' endpoint.
 *
 * @see https://app.swaggerhub.com/apis/feds01/supergroup-c_api/1.0.0#/resources/post_api_sg_resources_import
 * */
registerRoute(router, '/callback', {
    method: 'get',
    params: z.object({}),
    query: z.object({ from: z.string().url(), state: z.string(), token: z.string() }),
    headers: z.object({}),
    permission: null,
    handler: async (req) => {
        const { from, state, token } = req.query;
        Logger.info(`Processing request from: ${from} with state: ${state}`);

        // We need to verify that the state is correct with the transaction table...
        const stateLink = await State.findOne({ state }).exec();

        if (!stateLink) {
            return {
                status: 'error',
                code: 401,
                message: 'Invalid state.',
            };
        }

        // We also need to make a verify request to the from service
        const userData = await makeRequest(stateLink.from, '/api/sg/sso/verify', SgUserSchema, {
            query: { token },
            method: 'post',
        });

        if (userData.status === 'error') {
            return {
                status: 'error',
                code: 400,
                message: `request failed due to: ${userData.type}`,
                errors: userData.errors,
            };
        }

        const { email, id } = userData.response;

        // try to find the user, if the user is marked as deleted, we essentially
        // have to revert this because we can't create a new document for them.
        // If, we can't find them, then we create a new document with the specified values.
        const user = await User.findOneAndUpdate({
            email,
            externalId: convertSgId(id),
        });

        const transformedUser = await transformSgUserToInternal(userData.response, user?.username);

        // We need to create the document...
        const importedUser = await expr(async () => {
            if (user === null) {
                return await new User({ ...transformedUser }).save();
            } else {
                await user.updateOne({ $set: { ...transformedUser } });
                return user;
            }
        });

        assert(typeof importedUser._id !== 'undefined');
        await State.findByIdAndDelete(stateLink.id).exec();

        // create the tokens
        const tokens = createTokens(importedUser._id.toString());
        const stringifiedTokens = qs.stringify(tokens);

        // Here we need to create or update the user and invalid the state so it can't be re-used.
        const path = new URL(
            `/auth/session?redirect=${stateLink.path}&${stringifiedTokens}`,
            config.frontendURI,
        );
        Logger.info(`Sending user back to: ${path.toString()}`);

        return {
            status: 'redirect',
            url: path.toString(),
        };
    },
});

/**
 * @version v1.0.0
 * @method POST
 * @url /api/sg/sso/verify
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/sg/sso/verify
 *
 *
 * @description This route is used by external services to verify the web token that they receive from
 * the callback and consequently receive user information using the token.
 *
 * @see https://app.swaggerhub.com/apis/feds01/supergroup-c_api/1.0.0#/authentication/post_api_sg_sso_verify
 * */
registerRoute(router, '/verify', {
    method: 'post',
    params: z.object({}),
    body: z.object({}),
    query: z.object({ token: IJwtSchema }),
    headers: z.object({}),
    permission: null,
    handler: async (req) => {
        const { token } = req.query;

        // now look up the user that's specified in the token.
        const { sub: id } = await verifyToken(token, config.jwtSecret);
        const user = await User.findById(id).exec();

        if (!user) {
            return {
                status: 'error',
                code: 404,
                message: "User doesn't exist.",
            };
        }
        return {
            status: 'ok',
            code: 200,
            data: {
                id: `${user.id}:${config.teamName}`,
                ...User.projectAsSg(user),
            },
        };
    },
});

export default router;
