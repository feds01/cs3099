import { z, ZodError } from 'zod';
import express from 'express';
import * as errors from '../common/errors';
import { getTokensFromHeader } from './auth';
import { IUserDocument } from '../models/User';
import {
    ensureValidPermissions,
    Permission,
    PermissionVerificationFn,
    defaultPermissionVerifier,
} from './permissions';
import { expr } from '../utils/expr';

type RequestMethodWithBody = 'post' | 'put' | 'patch';
type RequestMethodWithoutBody = 'delete' | 'get';
type RequestMethod = RequestMethodWithBody | RequestMethodWithoutBody;

function registrarHasBody<
    P,
    Params,
    Q,
    Query,
    Method extends RequestMethod,
    Body,
    RoutePermission extends Permission | null,
>(
    registrar: RegisterRoute<P, Params, Q, Query, Method, Body, RoutePermission>,
): registrar is RegisterRoute<
    P,
    Params,
    Q,
    Query,
    Method & RequestMethodWithBody,
    Body,
    RoutePermission
> {
    return (
        registrar.method === 'post' || registrar.method === 'put' || registrar.method === 'patch'
    );
}

export interface BasicRequest<Params, Query, Body> {
    params: Params;
    query: Query;
    body: Body;
}

export interface Request<Params, Query, Requester, Body> extends BasicRequest<Params, Query, Body> {
    raw: express.Request;
    requester: Requester;
}

type RegisterRoute<
    P,
    Params,
    Q,
    Query,
    Method extends RequestMethod,
    Body,
    RoutePermission extends Permission | null,
> = {
    method: Method;
    permission: RoutePermission;
    sgMode?: boolean;
    // @@Cleanup: Since permission verification doesn't actually use the body for any
    //            verification at the moment, we don't actually include in the verification
    //            of the permissions. This could be a limitation in the future, but it is hard
    //            to reason about whether it is null or not a given point,
    permissionVerification?: PermissionVerificationFn<Params, Query>;
    params: z.Schema<Params, z.ZodTypeDef, P>;
    query: z.Schema<Query, z.ZodTypeDef, Q>;
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
    Q,
    Query,
    Method extends RequestMethod,
    Body,
    RoutePermission extends Permission | null,
>(
    router: express.Router,
    path: string,
    registrar: RegisterRoute<P, Params, Q, Query, Method, Body, RoutePermission>,
) {
    const wrappedHandler = async (req: express.Request, res: express.Response) => {
        const params = await registrar.params.safeParseAsync(req.params);
        // type InputParams = typeof registrar.params._type;

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

        let basicRequest = { query: query.data, params: params.data };

        const permissions = await expr(async () => {
            if (registrar.permission !== null) {
                const tokenOrError = getTokensFromHeader(req, res);

                // Check whether it is the error variant
                if (typeof tokenOrError === 'string') {
                    return tokenOrError;
                }

                // Validate the permissions, but skip it if there are no specified permissions for the
                // current request.
                return await ensureValidPermissions(
                    registrar.permission,
                    tokenOrError.data.id,
                    basicRequest,
                    typeof registrar.permissionVerification === 'function'
                        ? registrar.permissionVerification
                        : defaultPermissionVerifier,
                );
            }

            return null;
        });

        if (typeof permissions === 'string') {
            return res.status(401).json({
                status: 'error',
                message: permissions,
            });
        }

        if (permissions?.valid === false) {
            return res.status(401).json({
                status: 'error',
                message: errors.UNAUTHORIZED,
            });
        }

        type Req =
            | {
                  status: 'ok';
                  body: Body | null;
              }
            | {
                  status: 'error';
                  error: ZodError<Body>;
              };

        const body: Req = await expr(async () => {
            if (registrarHasBody(registrar)) {
                const parsedBody = await registrar.body.safeParseAsync(req.body);

                // If the body parsing wasn't successful, fail here
                if (!parsedBody.success) {
                    return { status: 'error', error: parsedBody.error };
                }

                return { status: 'ok', body: parsedBody.data };
            }

            return { status: 'ok', body: null };
        });

        // hack
        if (body.status === 'error') {
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

        return await registrar.handler(
            // @ts-ignore
            { ...basicRequest, raw: req, requester: permissions?.user ?? null },
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

type Dictionary = { [index: string]: string };
export const GROUP_URI_MAP: Dictionary = {
    t06: 'https://cs3099user06.host.cs.st-andrews.ac.uk/',
    t12: 'https://cs3099user12.host.cs.st-andrews.ac.uk/',
    t15: 'https://cs3099user15.host.cs.st-andrews.ac.uk/',
    t21: 'https://cs3099user21.host.cs.st-andrews.ac.uk/',
    t24: 'https://cs3099user24.host.cs.st-andrews.ac.uk/',
    t27: 'https://cs3099user27.host.cs.st-andrews.ac.uk/',
};
