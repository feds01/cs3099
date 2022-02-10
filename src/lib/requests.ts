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
import { transformZodErrorIntoResponseError } from '../transformers/error';
import Logger from '../common/logger';
import { ApiResponse, handleResponse } from './response';

type RequestMethodWithBody = 'post' | 'put' | 'patch';
type RequestMethodWithoutBody = 'delete' | 'get';
type RequestMethod = RequestMethodWithBody | RequestMethodWithoutBody;

function registrarHasBody<
    Params,
    Query,
    Method extends RequestMethod,
    Body,
    RoutePermission extends Permission | null,
    Res,
>(
    registrar: RegisterRoute<Params, Query, Method, Body, RoutePermission, Res>,
): registrar is RegisterRoute<
    Params,
    Query,
    Method & RequestMethodWithBody,
    Body,
    RoutePermission,
    Res
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
    Params,
    Query,
    Method extends RequestMethod,
    Body,
    RoutePermission extends Permission | null,
    Res,
> = {
    method: Method;
    permission: RoutePermission;
    sgMode?: boolean;
    // @@Cleanup: Since permission verification doesn't actually use the body for any
    //            verification at the moment, we don't actually include in the verification
    //            of the permissions. This could be a limitation in the future, but it is hard
    //            to reason about whether it is null or not a given point,
    permissionVerification?: PermissionVerificationFn<Params, Query>;
    params: z.Schema<Params, z.ZodTypeDef, Record<string, any>>;
    query: z.Schema<Query, z.ZodTypeDef, Record<string, any>>;
    handler: (
        req: Request<
            Params,
            Query,
            RoutePermission extends null ? null : IUserDocument,
            Method extends RequestMethodWithBody ? Body : null
        >,
    ) => Promise<ApiResponse<Res>>;
} & (Method extends RequestMethodWithBody
    ? { body: z.Schema<Body, z.ZodTypeDef, Record<string, any>> }
    : {});

export default function registerRoute<
    Params,
    Query,
    Method extends RequestMethod,
    Body,
    RoutePermission extends Permission | null,
    Res,
>(
    router: express.Router,
    path: string,
    registrar: RegisterRoute<Params, Query, Method, Body, RoutePermission, Res>,
) {
    const wrappedHandler = async (req: express.Request, res: express.Response): Promise<void> => {
        try {
            const params = await registrar.params.parseAsync(req.params);
            const query = await registrar.query.parseAsync(req.query);

            let body: Body | null = null;

            // Only attempt to parse the body if this method type demands that there is
            // a body on the request.
            if (registrarHasBody(registrar)) {
                body = await registrar.body.parseAsync(req.body);
            }

            let basicRequest = { query, params, body };

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

            if (typeof permissions === 'string' || permissions?.valid === false) {
                throw new errors.ApiError(401, errors.UNAUTHORIZED);
            }

            const result = await registrar.handler({
                ...basicRequest,
                // @@Cleanup: would be nice if we could get rid of this!
                raw: req,
                // @ts-ignore
                requester: permissions?.user ?? null,
            });

            return handleResponse(res, result);
        } catch (e: unknown) {
            if (e instanceof ZodError) {
                res.status(400).json({
                    status: 'error',
                    message: "Request parameters didn't match the expected format.",
                    errors: transformZodErrorIntoResponseError(e),
                });
                return;
            }

            if (e instanceof errors.ApiError) {
                res.status(e.code).json({
                    status: 'error',
                    message: e.message,
                    ...(e.errors && { errors: e.errors }),
                });
                return;
            }

            // If something else went wrong that we don't quite understand, then we return an
            // internal server error as this was unexpected
            Logger.error(`Server encountered an unexpected error:\n${e}`);

            if (e instanceof Error) {
                Logger.error(`Error stack:\n${e.stack}`);
            }

            res.status(500).json({
                status: 'error',
                message: errors.INTERNAL_SERVER_ERROR,
            });
            return;
        }
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
