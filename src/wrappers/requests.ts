import { z } from 'zod';
import express from 'express';
import { JwtPayload } from 'jsonwebtoken';
import * as errors from '../common/errors';
import { getTokensFromHeader } from './auth';
import User, { IUserRole } from '../models/User';

// Request method types
type RequestMethodWithBody = 'post' | 'put' | 'patch';
type RequestMethodWithoutBody = 'delete' | 'get';
type RequestMethod = RequestMethodWithBody | RequestMethodWithoutBody;

interface RegisterRouteBase<P, Q> {
    params: z.Schema<P>;
    query: z.Schema<Q>;
    permission: IUserRole;
}

interface BasicRequest<P, Q> {
    params: P;
    query: Q;
    token: JwtPayload;
    raw: express.Request;
}

interface RequestWithBody<P, B, Q> extends BasicRequest<P, Q> {
    body: B;
}

interface RegisterRouteWithBody<P, B, Q, M extends RequestMethodWithBody>
    extends RegisterRouteBase<P, Q> {
    method: M;
    body: z.Schema<B>;
    handler: (req: RequestWithBody<P, B, Q>, res: express.Response) => Promise<unknown>;
}

interface RegisterRouteWithoutBody<P, Q, M extends RequestMethodWithoutBody>
    extends RegisterRouteBase<P, Q> {
    method: M;
    handler: (req: BasicRequest<P, Q>, res: express.Response) => Promise<unknown>;
}

type RegisterRoute<P, B, Q, M extends RequestMethod> = M extends RequestMethodWithBody
    ? RegisterRouteWithBody<P, B, Q, M>
    : M extends RequestMethodWithoutBody
    ? RegisterRouteWithoutBody<P, Q, M>
    : never;

async function ensureValidPermissions(permission: IUserRole, token: JwtPayload): Promise<boolean> {
    // Lookup the user in the current request
    const user = await User.findById(token.data.id);

    if (!user || user.role !== permission) {
        return false;
    }

    // // Now we need to get the current resource specified and check if the current user
    // // has the appropriate permissions on the resource
    // if (permission === IUserRole.Default) {
    //     switch (resource) {
    //         case "comment": {

    //         }
    //         case "publication": {

    //         }
    //         case "comment": {

    //         }
    //     }
    // }
    return true;
}

export default function registerRoute<P, B, Q, M extends RequestMethod>(
    router: express.Router,
    path: string,
    registrar: RegisterRoute<P, B, Q, M>,
) {
    const wrappedHandler = async (req: express.Request, res: express.Response) => {
        const params = await registrar.params.safeParseAsync(req.params);
        const query = await registrar.query.safeParseAsync(req.query);

        // If the parameter parsing wasn't successful, fail here
        if (!params.success) {
            return res.status(400).json({
                status: false,
                message: "Bad request, parameter didn't match.",
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
                message: "Bad request, parameter didn't match.",
                extra: {
                    errors: {
                        ...query.error,
                    },
                },
            });
        }

        const token = getTokensFromHeader(req, res);

        if (!token) {
            return res.status(401).json({
                status: false,
                message:
                    "Unauthorized. User doesn't have sufficient permissions to perform this request",
            });
        }

        // Now validate the permissions
        const permissionsValid = await ensureValidPermissions(registrar.permission, token);

        if (!permissionsValid) {
            return res.status(401).json({
                status: false,
                message: errors.UNAUTHORIZED,
            });
        }

        const basicRequest = {
            query: query.data,
            params: params.data,
            token,
            raw: req,
        };
        if ('body' in registrar) {
            const body = await registrar.body.safeParseAsync(req.body);

            // If the body parsing wasn't successful, fail here
            if (!body.success) {
                return res.status(400).json({
                    status: false,
                    message: "Bad request, parameter didn't match.",
                    extra: {
                        errors: {
                            ...body.error,
                        },
                    },
                });
            }

            return await registrar.handler({ ...basicRequest, body: body.data }, res);
        }
        return await registrar.handler(basicRequest, res);
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
