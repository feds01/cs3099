import express from 'express';
import { ZodError, z } from 'zod';

import * as errors from '../../common/errors';
import Logger from '../../common/logger';
import { IUserDocument } from '../../models/User';
import { transformZodErrorIntoResponseError } from '../../transformers/error';
import { expr } from '../../utils/expr';
import ActivityRecord, { ActivityType } from '../activity';
import { ActivityMetadataTransformer, defaultActivityMetadataFn } from '../activity/transformer';
import { getTokensFromHeader } from '../auth/auth';
import {
    Permission,
    PermissionVerificationFn,
    defaultPermissionVerifier,
    ensureValidPermissions,
} from './permissions';
import { ApiResponse, handleResponse } from './response';

type RequestMethodWithBody = 'post' | 'put' | 'patch';
type RequestMethodWithoutBody = 'delete' | 'get';
type RequestMethod = RequestMethodWithBody | RequestMethodWithoutBody;

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
    activity?: ActivityType;
    // @@Cleanup: Since permission verification doesn't actually use the body for any
    //            verification at the moment, we don't actually include in the verification
    //            of the permissions. This could be a limitation in the future, but it is hard
    //            to reason about whether it is null or not a given point,
    permissionVerification?: PermissionVerificationFn<Params, Query, unknown>;
    activityMetadataFn?: ActivityMetadataTransformer<Params, Query, Body | null>;
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

            const basicRequest = { query, params, body };

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
                throw new errors.ApiError(401, permissions);
            }

            // Report a more informative error if the information is available
            if (permissions !== null && !permissions.valid) {
                throw new errors.ApiError(
                    typeof permissions.code === 'undefined' ? 401 : permissions.code,
                    typeof permissions.message === 'undefined'
                        ? errors.UNAUTHORIZED
                        : permissions.message,
                );
            }

            // Here we pass the parameters of the request in order to determine whether we can record
            // a particular event, if the function returns the id of the activity, we know that the
            // server has recorded an activity and it could be marked as valid, or otherwise it will
            // be deleted in the event of the request being invalid
            const activity = expr(() => {
                if (typeof registrar.activity !== 'undefined') {
                    return new ActivityRecord(
                        registrar.activity,
                        basicRequest,
                        permissions?.user || null,
                        typeof registrar.activityMetadataFn !== 'undefined'
                            ? registrar.activityMetadataFn
                            : defaultActivityMetadataFn,
                    );
                } else {
                    return null;
                }
            });

            await activity?.begin();

            const result = await registrar.handler({
                ...basicRequest,
                // @@Cleanup: would be nice if we could get rid of this!
                raw: req,
                // @ts-ignore
                requester: permissions?.user ?? null,
            });

            return await handleResponse(res, result, activity);
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
            if (e instanceof Error) {
                Logger.error(`Server encountered an unexpected error:\n${e.message}`);

                if (typeof e.stack !== 'undefined') {
                    Logger.error(`Error stack:\n${e.stack}`);
                }
            }

            res.status(500).json({
                status: 'error',
                message: errors.INTERNAL_SERVER_ERROR,
            });
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
