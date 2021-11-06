import { z } from 'zod';
import express from 'express';
import * as errors from '../common/errors';
import { getTokensFromHeader } from './auth';
import { IUserDocument, IUserRole } from '../models/User';
import { ensureValidPermissions } from './permissions';

type RequestMethodWithBody = 'post' | 'put' | 'patch';
type RequestMethodWithoutBody = 'delete' | 'get';
type RequestMethod = RequestMethodWithBody | RequestMethodWithoutBody;

interface Request<Params, Query, Requester, Body> {
    params: Params;
    query: Query;
    raw: express.Request;
    requester: Requester;
    body: Body;
}

type RegisterRoute<
    Params,
    Query,
    Method extends RequestMethod,
    Body,
    Permission extends IUserRole | null,
> = {
    method: Method;
    permission: Permission;
    params: z.Schema<Params>;
    query: z.Schema<Query>;
    handler: (
        req: Request<
            Params,
            Query,
            Permission extends null ? null : IUserDocument,
            Method extends RequestMethodWithBody ? Body : null
        >,
        res: express.Response,
    ) => Promise<unknown>;
} & (Method extends RequestMethodWithBody ? { body: z.Schema<Body> } : {});

export default function registerRoute<
    Params,
    Query,
    Method extends RequestMethod,
    Body,
    Permission extends IUserRole | null,
>(
    router: express.Router,
    path: string,
    registrar: RegisterRoute<Params, Query, Method, Body, Permission>,
) {
    const wrappedHandler = async (req: express.Request, res: express.Response) => {
        const params = await registrar.params.safeParseAsync(req.params);
        const query = await registrar.query.safeParseAsync(req.query);

        // If the parameter parsing wasn't successful, fail here
        if (!params.success) {
            return res.status(400).json({
                status: false,
                message:
                    "Bad request, endpoint path parameter schema didn't match to provided path parameters.",
                extra: {
                    errors: {
                        ...params.error,
                    },
                },
            });
        }

        // If the query parsing wasn't successful, fail here
        if (!query.success) {
            return res.status(400).json({
                status: false,
                message:
                    "Bad request, endpoint query schema didn't match to provided query fields.",
                extra: {
                    errors: {
                        ...query.error,
                    },
                },
            });
        }

        let permissions;

        if (registrar.permission !== null) {
            const token = getTokensFromHeader(req, res);
            if (typeof token === 'string') {
                return res.status(401).json({
                    status: false,
                    message: token,
                });
            }

            // Validate the permissions, but skip it if there are no specified permissions for the
            // current request.
            permissions = await ensureValidPermissions(registrar.permission, token.data.id);

            if (!permissions.valid) {
                return res.status(401).json({
                    status: false,
                    message: errors.UNAUTHORIZED,
                });
            }
        }

        const basicRequest = {
            query: query.data,
            params: params.data,
            raw: req,
        };

        if ('body' in registrar) {
            const registrarWithBody = registrar as RegisterRoute<
                Params,
                Query,
                RequestMethodWithBody,
                Body,
                Permission
            >;
            const body = await registrarWithBody.body.safeParseAsync(req.body);

            // If the body parsing wasn't successful, fail here
            if (!body.success) {
                return res.status(400).json({
                    status: false,
                    message: "Bad request, endpoint body schema didn't match to provided body.",
                    extra: {
                        errors: {
                            ...body.error,
                        },
                    },
                });
            }

            if (typeof permissions === 'undefined') {
                const r = registrar as RegisterRoute<
                    Params,
                    Query,
                    RequestMethodWithBody,
                    Body,
                    null
                >;
                return await r.handler({ ...basicRequest, requester: null, body: body.data }, res);
            }

            // We only have to do this because typescript isn't smart enough to coerce types yet
            // in the way we want to.
            const r = registrar as RegisterRoute<
                Params,
                Query,
                RequestMethodWithBody,
                Body,
                IUserRole
            >;

            return await r.handler(
                { ...basicRequest, requester: permissions.user, body: body.data },
                res,
            );
        }

        if (typeof permissions === 'undefined') {
            const registrarWithoutBody = registrar as unknown as RegisterRoute<
                Params,
                Query,
                RequestMethodWithoutBody,
                Body,
                null
            >;
            return await registrarWithoutBody.handler(
                { ...basicRequest, requester: null, body: null },
                res,
            );
        }

        const registrarWithBody = registrar as unknown as RegisterRoute<
            Params,
            Query,
            RequestMethodWithoutBody,
            Body,
            IUserRole
        >;
        return await registrarWithBody.handler(
            { ...basicRequest, requester: permissions.user, body: null },
            res,
        );
    };

    // now add the method to the router
    switch (registrar.method) {
        case 'delete':
            router.delete(path, wrappedHandler);
            return;
        case 'patch':
            router.patch(path, wrappedHandler);
            return;
        case 'put':
            router.put(path, wrappedHandler);
            return;
        case 'post':
            router.post(path, wrappedHandler);
            return;
        case 'get':
            router.get(path, wrappedHandler);
            return;
        default:
            throw new Error('Unreachable');
    }
}
