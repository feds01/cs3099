import { z } from 'zod';
import express from 'express';
import * as errors from '../common/errors';
import { getTokensFromHeader } from './auth';
import { IUserDocument } from '../models/User';
import { ensureValidPermissions, Permission } from './permissions';

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
    P,
    Params,
    Query,
    Method extends RequestMethod,
    Body,
    RoutePermission extends Permission | null,
> = {
    method: Method;
    permission: RoutePermission;
    sgMode?: boolean;
    params: z.Schema<Params, z.ZodTypeDef, P>;
    query: z.Schema<Query>;
    handler: (
        req: Request<
            Params,
            Query,
            RoutePermission extends null ? null : IUserDocument,
            Method extends RequestMethodWithBody ? Body : null
        >,
        res: express.Response,
    ) => Promise<unknown>;
} & (Method extends RequestMethodWithBody ? { body: z.Schema<Body> } : {});

export default function registerRoute<
    P,
    Params,
    Query,
    Method extends RequestMethod,
    Body,
    RoutePermission extends Permission | null,
>(
    router: express.Router,
    path: string,
    registrar: RegisterRoute<P, Params, Query, Method, Body, RoutePermission>,
) {
    const wrappedHandler = async (req: express.Request, res: express.Response) => {
        const params = await registrar.params.safeParseAsync(req.params);
        type InputParams = typeof registrar.params._type;

        const query = await registrar.query.safeParseAsync(req.query);

        // If the parameter parsing wasn't successful, fail here
        if (!params.success) {
            return res.status(400).json({
                status: 'error',
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
                status: 'error',
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
                    status: 'error',
                    message: token,
                });
            }

            let externalId;
            // @@Hack: so we assume that any requests that need a permission check via a sub-system pass their
            //         DocumentId parameter via the path parameters instead of any other way, therefore after verifying
            //         that the parameter ZodSchema has an id and it is an `ObjectId`, we can get this and use it as
            //         an external id, thus making a permission check with the id...
            //
            //         Personally, I think this is very hacky and could be better handled by a more robust permission
            //         system that can be generated based on the path of the endpoint using some generator function and
            //         then checked that way rather than relying on specific endpoint formats.
            const { hasOwnProperty } = Object.prototype;
            if (typeof params.data === 'object' && hasOwnProperty.call(params.data, 'id')) {
                // @ts-ignore @@CLEANUP @@CLEANUP @@CLEANUP
                externalId = params.data.id as string;
            }

            // Validate the permissions, but skip it if there are no specified permissions for the
            // current request.
            permissions = await ensureValidPermissions(
                registrar.permission,
                token.data.id,
                externalId,
            );

            if (!permissions.valid) {
                return res.status(401).json({
                    status: 'error',
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
                P,
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
                    status: 'error',
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
                    InputParams,
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
                P,
                Params,
                Query,
                RequestMethodWithBody,
                Body,
                Permission
            >;

            return await r.handler(
                { ...basicRequest, requester: permissions.user, body: body.data },
                res,
            );
        }

        if (typeof permissions === 'undefined') {
            const registrarWithoutBody = registrar as unknown as RegisterRoute<
                P,
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
            P,
            Params,
            Query,
            RequestMethodWithoutBody,
            Body,
            Permission
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
