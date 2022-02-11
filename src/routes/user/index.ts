import * as error from '../../common/errors';
import { verifyUserPermission } from '../../lib/permissions';
import registerRoute from '../../lib/requests';
import Follower from '../../models/Follower';
import User, { IUserRole } from '../../models/User';
import { ModeSchema } from '../../validators/requests';
import { IUserPatchRequestSchema, IUserRoleRequestSchema } from '../../validators/user';
import * as userUtils from './../../utils/users';
import followerRouter from './followers';
import reviewRouter from './reviews';
import assert from 'assert';
import express from 'express';
import { z } from 'zod';

const router = express.Router();

// Register the follower routes
router.use('/', followerRouter);
// Register the review routes
router.use('/', reviewRouter);

/**
 * @version v1.0.0
 * @method GET
 * @url /api/user
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/user
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
    params: z.object({ username: z.string() }),
    query: z.object({ mode: ModeSchema }),
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
    params: z.object({ username: z.string() }),
    query: z.object({ mode: ModeSchema }),
    body: IUserPatchRequestSchema,
    permissionVerification: verifyUserPermission,
    permission: { level: IUserRole.Administrator },
    handler: async (req) => {
        const user = await userUtils.transformUsernameIntoId(req);

        const response = req.body;
        const update = { $set: { ...response } };
        const queryOptions = { new: true }; // new as in return the updated document

        // So take the fields that are to be updated into the set request, it's okay to this because
        // we validated the request previously and we should be able to add all of the fields into the
        // database. If the user tries to update the username or an email that's already in use, mongo
        // will return an error because these fields have to be unique.
        const newUser = await User.findByIdAndUpdate(user.id, update, queryOptions).exec();

        // If we couldn't find the user.
        if (!newUser) {
            return {
                status: 'error',
                code: 404,
                message: error.RESOURCE_NOT_FOUND,
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
    params: z.object({ username: z.string() }),
    query: z.object({ mode: ModeSchema }),
    permissionVerification: verifyUserPermission,
    permission: { level: IUserRole.Administrator },
    handler: async (req) => {
        const user = await userUtils.transformUsernameIntoId(req);

        const deletedUser = await User.findByIdAndDelete(user.id).exec();

        if (!deletedUser) {
            return {
                status: 'error',
                code: 404,
                message: error.RESOURCE_NOT_FOUND,
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
    params: z.object({ username: z.string() }),
    query: z.object({ mode: ModeSchema }),
    permissionVerification: verifyUserPermission,
    permission: { level: IUserRole.Administrator },
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
    params: z.object({ username: z.string() }),
    query: z.object({ mode: ModeSchema }),
    body: IUserRoleRequestSchema,
    permission: { level: IUserRole.Administrator },
    handler: async (req) => {
        const user = await userUtils.transformUsernameIntoId(req);

        const newUser = await User.findByIdAndUpdate(
            user.id,
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
