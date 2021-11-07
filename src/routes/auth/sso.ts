import { z } from 'zod';
import express from 'express';
import User from '../../models/User';
import { config } from '../../server';
import Logger from '../../common/logger';
import registerRoute from '../../lib/requests';
import { IJwtSchema } from '../../validators/auth';
import { JwtError, verifyToken } from '../../lib/auth';
import State from '../../models/State';

const router = express.Router();

registerRoute(router, "/sso/login",  {
    method: "get",
    params: z.object({}),
    query: z.object({from: z.string().url(), state: z.string()}),
    permission: null,
    handler: async (req, res) => {
        const {from, state} = req.query;

        // just forward the request with the query parameters to the frontend login endpoint.
        res.redirect(`${config.frontendURI}/login?from=${from}&state=${state}`);
    }
});

registerRoute(router, "/sso/callback",  {
    method: "get",
    params: z.object({}),
    query: z.object({from: z.string().url(), state: z.string()}),
    permission: null,
    handler: async (req, res) => {
        const {from, state} = req.query;

        // We need to verify that the state is correct with the transaction table...
        const stateLink = await State.findOne({ from, state }).exec();

        if (!stateLink) {
            return res.status(401).json({
                status: "error",
                message: "Invalid state."
            })
        }
        
        // We also need to make a verify request to the from service 
        // Here we need to create or update the user and invalid the state so it can't be re-used.

        return res.redirect(config.frontendURI);
    }
})

registerRoute(router, "/sso/verify", {
    method: "post",
    params: z.object({}),
    query: z.object({token: IJwtSchema}),
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
                    status: "error",
                    message: "User doesn't exist."
                })
            }
            return res.status(200).json({
                status: "ok",
                user_id: `${user.id}:${config.teamName}`,
                user: {
                    ...User.projectAsSg(user)
                }
            })
        } catch (e: unknown) {
            if (e instanceof JwtError) {
                
                // Specifically mention that the jwt has expired.
                if (e.type === "expired") {
                    return res.status(401).json({
                        status: "error",
                        message: "JSON web token has expired."
                    })
                }

                return res.status(401).json({
                    status: "error",
                    message: "Invalid JSON web token."
                })
            }

            Logger.error(e);
            return res.status(500).json({
                status: "error",
                message: "Internal Server Error"
            })
        }
    }
});

export default router;
