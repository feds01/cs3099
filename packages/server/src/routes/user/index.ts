import assert from 'assert';
import express from 'express';
import { z } from 'zod';

import * as errors from '../../common/errors';
import * as userUtils from './../../utils/users';
import {
    compareUserRoles,
    defaultPermissionVerifier,
    verifyUserPermission,
} from '../../lib/communication/permissions';
import registerRoute from '../../lib/communication/requests';
import { deleteFileResource, resourceExists } from '../../lib/resources/fs';
import Follower from '../../models/Follower';
import User, { IUserRole } from '../../models/User';
import { config } from '../../server';
import { ResponseErrorSummary } from '../../transformers/error';
import { UserAggregation } from '../../types/aggregation';
import { expr } from '../../utils/expr';
import { escapeRegExp } from '../../utils/regex';
import { joinPathsForResource } from '../../utils/resources';
import { PaginationQuerySchema } from '../../validators/pagination';
import { ModeSchema } from '../../validators/requests';
import {
    IUserPatchRequestSchema,
    IUserRoleRequestSchema,
    UserByUsernameRequestSchema,
} from '../../validators/user';
import activityRouter from './activity';
import followerRouter from './followers';
import reviewRouter from './reviews';

const router = express.Router();

router.use('/', followerRouter);
router.use('/', reviewRouter);
router.use('/', activityRouter);

/**
 * @version v1.0.0
 * @method GET
 * @url /api/user
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/user?take=10
 *
 * >>> response:
 * {
 *  "status": "ok",
 *  "users": [
 *    {
 *      "name": "william"
 *      ...
 *    },
 *    ...
 *  ],
 *  skip: 0,
 *  total: 3,
 *  take: 10
 * }
 *
 * @description This route is used get a paginated list of users on the platform. This
 * is primarily used when searching for items across the platform
 *
 * @error {UNAUTHORIZED} if the request does not contain a token or refreshToken
 * */
registerRoute(router, '/', {
    method: 'get',
    params: z.object({}),
    query: z.object({ search: z.string().optional() }).merge(PaginationQuerySchema),
    headers: z.object({}),
    permissionVerification: defaultPermissionVerifier,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const { take, skip } = req.query;
        const regex = expr(() => {
            if (typeof req.query.search !== 'undefined') {
                return new RegExp(escapeRegExp(req.query.search), 'i');
            }
            return undefined;
        });

        // We want to find all users that might match the provided search query
        // in either username or name
        const aggregation = (await User.aggregate([
            {
                $facet: {
                    data: [
                        {
                            $match:
                                typeof regex !== 'undefined'
                                    ? {
                                          $or: [
                                              { username: { $regex: regex } },
                                              { name: { $regex: regex } },
                                          ],
                                      }
                                    : {},
                        },
                        { $sort: { _id: -1 } },
                        { $skip: skip },
                        { $limit: take },
                    ],
                    total: [{ $count: 'total' }],
                },
            },
            {
                $project: {
                    data: 1,
                    // Get total from the first element of the metadata array
                    total: { $arrayElemAt: ['$total.total', 0] },
                },
            },
        ])) as unknown as [UserAggregation];

        const result = aggregation[0];

        return {
            status: 'ok',
            code: 200,
            data: {
                users: result.data.map((user) => User.project(user, false)),
                total: result.total ?? 0,
                skip,
                take,
            },
        };
    },
});

/**
 * @version v1.0.0
 * @method GET
 * @url /api/user/:username
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/user/feds01
 *
 * >>> response:
 * {
 *  "status": "ok",
 *  "user": {
 *      "name": "william"
 *      ...
 *  }
 * }
 *
 * @description This route is used to fetch information about a user account, the route
 * will accept a token in the header of the request to authenticate the request.
 *
 * @error {UNAUTHORIZED} if the request does not contain a token or refreshToken
 *
 * @return sends a response to client if user successfully (or not) logged in. The response contains
 * information about the user.
 *
 * */
registerRoute(router, '/:username', {
    method: 'get',
    params: UserByUsernameRequestSchema,
    query: z.object({ mode: ModeSchema }),
    headers: z.object({}),
    permissionVerification: verifyUserPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const user = await userUtils.transformUsernameIntoId(req);

        // we want to count the followers of the user and following entries
        // @@Performance: Maybe in the future store these numbers and update them when follow/unfollow events occur
        const followingCount = await Follower.count({ follower: user.id }).exec();
        const followerCount = await Follower.count({ following: user.id }).exec();

        return {
            status: 'ok',
            code: 200,
            data: {
                user: User.project(user),
                follows: {
                    followers: followerCount,
                    following: followingCount,
                },
            },
        };
    },
});

/**
 * @version v1.0.0
 * @method GET
 * @url /api/user/:username/avatar
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/user/feds01/avatar
 *
 * @description This route is used to get a user's avatar if they have one set.
 *
 * @error {NOT_FOUND} if the requested user does not have a avatar
 *
 * */
registerRoute(router, '/:username/avatar', {
    method: 'get',
    params: UserByUsernameRequestSchema,
    query: z.object({ mode: ModeSchema }),
    headers: z.object({}),
    permission: null,
    permissionVerification: undefined,
    handler: async (req) => {
        const user = await userUtils.transformUsernameIntoId(req);

        if (user.profilePictureUrl) {
            const path = joinPathsForResource('avatar', user.id, 'avatar');

            if (!(await resourceExists(path))) {
                // If we can't find the avatar file on disk and the user requested it, then we should set
                // that the user has no avatar picture set...
                if (user.profilePictureUrl.startsWith(config.serviceEndpoint)) {
                    await user.updateOne({ $set: { profilePictureUrl: undefined } });
                }

                return {
                    status: 'error',
                    code: 404,
                    message: errors.RESOURCE_NOT_FOUND,
                };
            }

            return {
                status: 'file',
                code: 200,
                file: path,
            };
        } else {
            return {
                status: 'error',
                code: 404,
                message: errors.RESOURCE_NOT_FOUND,
            };
        }
    },
});

/**
 * @version v1.0.0
 * @method DELETE
 * @url /api/user/:username/avatar
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/user/feds01/avatar
 *
 * @description This route is used to delete a user's avatar if they have one set.
 *
 * */
registerRoute(router, '/:username/avatar', {
    method: 'delete',
    params: UserByUsernameRequestSchema,
    query: z.object({ mode: ModeSchema }),
    headers: z.object({}),
    permissionVerification: verifyUserPermission,
    permission: { level: IUserRole.Administrator },
    handler: async (req) => {
        const user = req.permissionData;

        if (user.profilePictureUrl) {
            const resourcePath = joinPathsForResource('avatar', user._id.toString(), 'avatar');

            // First, we want to update the database to state that the user has no avatar
            // and then we can remove the file from the disk.
            await user.updateOne({ $set: { profilePictureUrl: undefined } });
            await deleteFileResource(resourcePath);
        }

        return {
            status: 'ok',
            code: 200,
        };
    },
});

/**
 * @version v1.0.0
 * @method PATCH
 * @url /api/user
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/user
 * >>> body:
 * {
 *  "name": "william"
 * }
 *
 * >>> response:
 * {
 *  "message": "Successfully updated user information",
 *  ...,
 *  "user": {
 *      "name": "william"
 *      ...
 *  }
 * }
 *
 * @description This route is used to update information of a user account.
 *
 * @error {UNAUTHORIZED} if the request does not contain a token.
 *
 * @return sends a response to client if user successfully updated, with the new updated user
 * information.
 * */
registerRoute(router, '/:username', {
    method: 'patch',
    params: UserByUsernameRequestSchema,
    query: z.object({ mode: ModeSchema }),
    headers: z.object({}),
    body: IUserPatchRequestSchema,
    permissionVerification: verifyUserPermission,
    permission: { level: IUserRole.Moderator, hierarchy: true },
    handler: async (req) => {
        const user = req.permissionData;
        const userId = user._id.toString();

        // Verify that email and username aren't taken...
        const { username, email } = req.body;

        // We need to check that if either one field is specified, we should add an
        // 'or' clause into the query. If neither fields are specified, the 'or' query
        // will fail because MongoDB disallows an empty 'or' clause.
        if (typeof username !== 'undefined' || typeof email !== 'undefined') {
            const searchQueryUser = {
                _id: { $ne: userId },
                $or: [
                    ...(typeof username !== 'undefined' ? [{ username }] : []),
                    ...(typeof email !== 'undefined'
                        ? [{ email, externalId: { $exists: false } }]
                        : []),
                ],
            };

            const search = await User.findOne(searchQueryUser).exec();

            if (typeof username !== 'undefined' && search?.username === username) {
                return {
                    status: 'error',
                    code: 400,
                    message: errors.BAD_REQUEST,
                    errors: {
                        username: {
                            message: 'Username already taken',
                        },
                    } as ResponseErrorSummary,
                };
            } else if (typeof email !== 'undefined' && search?.email === email) {
                return {
                    status: 'error',
                    code: 400,
                    message: errors.BAD_REQUEST,
                    errors: {
                        email: {
                            message: 'Email already taken',
                        },
                    } as ResponseErrorSummary,
                };
            }
        }

        // So take the fields that are to be updated into the set request, it's okay to this because
        // we validated the request previously and we should be able to add all of the fields into the
        // database. If the user tries to update the username or an email that's already in use, mongo
        // will return an error because these fields have to be unique.
        const newUser = await User.findByIdAndUpdate(
            userId,
            { $set: { ...req.body } },
            { new: true },
        ).exec();

        // If we couldn't find the user.
        if (!newUser) {
            return {
                status: 'error',
                code: 404,
                message: errors.RESOURCE_NOT_FOUND,
            };
        }

        return {
            status: 'ok',
            code: 200,
            data: {
                user: User.project(newUser),
            },
        };
    },
});

/**
 * @version v1.0.0
 * @method DELETE
 * @url /api/user/:username
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/user/feds01
 *
 * @description This route is used to delete  a user account, the route
 * will accept a token in the header of the request to authenticate the request.
 *
 * @error {UNAUTHORIZED} if the request does not contain a token or refreshToken
 *
 * @return sends a response to client if user was successfully deleted or not.
 * */
registerRoute(router, '/:username', {
    method: 'delete',
    params: UserByUsernameRequestSchema,
    query: z.object({ mode: ModeSchema }),
    headers: z.object({}),
    permissionVerification: verifyUserPermission,
    permission: { level: IUserRole.Administrator },
    handler: async (req) => {
        const user = req.permissionData;
        const deletedUser = await User.findByIdAndDelete(user._id.toString()).exec();

        if (!deletedUser) {
            return {
                status: 'error',
                code: 404,
                message: errors.RESOURCE_NOT_FOUND,
            };
        }

        return { status: 'ok', code: 200 };
    },
});

/**
 * @version v1.0.0
 * @method GET
 * @url /api/user/:username/role
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/user/616f115feb505663f8bce3e2/role
 * >>> response: {
 *  "status": "true",
 *  "role": "default"
 * }
 *
 * @description This route is used to get the role of a user.
 *
 * @error {UNAUTHORIZED} if the request is not sent by an administrator.
 *
 * @return sends the role of the specified user.
 * */
registerRoute(router, '/:username/role', {
    method: 'get',
    params: UserByUsernameRequestSchema,
    query: z.object({ mode: ModeSchema }),
    headers: z.object({}),
    permissionVerification: verifyUserPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const user = await userUtils.transformUsernameIntoId(req);

        return {
            status: 'ok',
            code: 200,
            data: {
                role: user.role,
            },
        };
    },
});

/**
 * @version v1.0.0
 * @method PATCH
 * @url /api/user/<id>/role
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/user/<616f115feb505663f8bce3e2>/role
 * >>> body:
 * {
 *  "role": "moderator"
 * }
 *
 * >>> response:
 * {
 *  "message": "Successfully updated user role",
 *  "role": "moderator"
 * }
 *
 * @description This route is used to allow administrator to update any user's role.
 *
 * @error {UNAUTHORIZED} if the request is not sent by an administrator.
 *
 * @return sends a response to client if user role successfully updated, with the new updated user role
 * information.
 * */
registerRoute(router, '/:username/role', {
    method: 'patch',
    params: UserByUsernameRequestSchema,
    query: z.object({ mode: ModeSchema }),
    headers: z.object({}),
    body: IUserRoleRequestSchema,
    permissionVerification: verifyUserPermission,
    permission: { level: IUserRole.Moderator },
    handler: async (req) => {
        const user = req.permissionData;

        // Verify that the user can't elevate the privilege of this user beyond theirs
        if (!compareUserRoles(req.requester.role, req.body.role)) {
            return {
                status: 'error',
                code: 401,
                message: errors.UNAUTHORIZED,
                errors: {
                    role: {
                        message: `Can't elevate privilege to ${req.body.role}`,
                    },
                },
            };
        }

        // Verify that the requester cannot modify the permission of a user that has a higher privilege
        if (!compareUserRoles(req.requester.role, req.permissionData.role)) {
            throw new errors.ApiError(
                400,
                'User cannot modify permissions of higher privileged users',
            );
        }

        // Verify that the requester cannot modify their own privilege
        if (req.requester.id === req.permissionData._id.toString()) {
            throw new errors.ApiError(400, 'User cannot modify own permission');
        }

        const newUser = await User.findByIdAndUpdate(
            user._id.toString(),
            { $set: { ...req.body } },
            { new: true },
        );
        assert(newUser !== null);

        return {
            status: 'ok',
            code: 200,
            data: {
                role: newUser.role,
            },
        };
    },
});

export default router;
