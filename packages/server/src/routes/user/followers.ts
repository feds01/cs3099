import express from 'express';
import { z } from 'zod';

import * as error from '../../common/errors';
import * as userUtils from '../../utils/users';
import { verifyUserPermission } from '../../lib/communication/permissions';
import registerRoute from '../../lib/communication/requests';
import Follower from '../../models/Follower';
import User, { IUser, IUserRole } from '../../models/User';
import { PaginationQuerySchema } from '../../validators/pagination';
import { ModeSchema } from '../../validators/requests';
import { UserByUsernameRequestSchema } from '../../validators/user';

const router = express.Router({ mergeParams: true });

/**
 * @version v1.0.0
 * @method POST
 * @url /api/user/:id/follow
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/user/616f115feb325663f8bce3a4/follow
 * >>> body: {}
 *
 * @description This route is used to follow a user. The router accepts a token
 * in the header and retrieves the current user id from the token, it also
 * accepts the followee's id which is specified in the url. Then it adds a
 * mapping of them to the database.
 *
 * @error {SELF_FOLLOWING} if the user account is trying to follow itself.
 * @error {NON_EXISTENT_USER} if the specified user does not exist.
 *
 * */
registerRoute(router, '/:username/follow', {
    method: 'post',
    params: UserByUsernameRequestSchema,
    body: z.object({}),
    query: z.object({ mode: ModeSchema }),
    headers: z.object({}),
    permissionVerification: verifyUserPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const user = await userUtils.transformUsernameIntoId(req);

        const { id: followerId } = req.requester;

        // check if the user is already following the other user, if so
        // then exit early and don't create the new follower link.
        const follower = await User.findById(followerId).exec();

        if (!follower) {
            return {
                status: 'error',
                code: 404,
                message: error.NON_EXISTENT_USER,
            };
        }

        // if the user is trying to follow itself
        // Just return a NoContent since we don't need to create anything
        if (follower.id === user.id) {
            return {
                code: 204,
                status: 'ok',
            };
        }

        let mapping = { follower: follower.id, following: user.id };

        // check if the user is already following, if so, exit early and return
        // corresponding messages
        const doc = await Follower.findOne(mapping).exec();

        if (doc) {
            return { status: 'ok', code: 200 };
        }

        await new Follower(mapping).save();

        return { status: 'ok', code: 201 };
    },
});

/**
 * @version v1.0.0
 * @method DELETE
 * @url /api/user/:id/follow
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/user/616f115feb325663f8bce3a4/follow
 *
 * @description This route is used to remove a follow from a user.
 *
 * @error {SELF_FOLLOWING} if the user account is trying to unfollow itself.
 * @error {NON_EXISTENT_USER} if the specified user does not exist.
 *
 * */
registerRoute(router, '/:username/follow', {
    method: 'delete',
    params: UserByUsernameRequestSchema,
    query: z.object({ mode: ModeSchema }),
    headers: z.object({}),
    permissionVerification: verifyUserPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const user = await userUtils.transformUsernameIntoId(req);

        const { id: followerId } = req.requester;

        // check if the user is already following the other user, if so
        // then exit early and don't create the new follower link.
        const follower = await User.findById(followerId).exec();

        if (!follower) {
            return {
                status: 'error',
                code: 404,
                message: error.RESOURCE_NOT_FOUND,
            };
        }

        await Follower.findOneAndDelete({
            follower: follower.id,
            following: user.id,
        }).exec();

        return { status: 'ok', code: 200 };
    },
});

/**
 * @version v1.0.0
 * @method GET
 * @url /api/user/:id/follow
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/user/616f115feb325663f8bce3a4/follow
 *
 * @description This route is used to check if the requester is following the specified
 * user by their username.
 * */
registerRoute(router, '/:username/follow', {
    method: 'get',
    params: UserByUsernameRequestSchema,
    query: z.object({ mode: ModeSchema }),
    headers: z.object({}),
    permissionVerification: verifyUserPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const user = await userUtils.transformUsernameIntoId(req);

        const { id: followerId } = req.requester;

        // check if the user is already following the other user, if so
        // then exit early and don't create the new follower link.
        const follower = await User.findById(followerId).exec();

        if (!follower) {
            return {
                status: 'error',
                code: 404,
                message: error.RESOURCE_NOT_FOUND,
            };
        }

        const link = await Follower.findOne({
            follower: follower.id,
            following: user.id,
        }).exec();

        return {
            status: 'ok',
            code: 200,
            data: {
                following: link !== null,
            },
        };
    },
});

/**
 * @version v1.0.0
 * @method GET
 * @url /api/user/:id/followers
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/user/616f115feb325663f8bce3a4/followers
 *
 * @description This route is used to list all of the followers of the requester.
 * */
registerRoute(router, '/:username/followers', {
    method: 'get',
    params: UserByUsernameRequestSchema,
    query: z.object({ mode: ModeSchema }).merge(PaginationQuerySchema),
    headers: z.object({}),
    permissionVerification: verifyUserPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const user = await userUtils.transformUsernameIntoId(req);

        const { take, skip } = req.query;
        const result = await Follower.find({ following: user.id })
            .populate<{ follower: IUser }>('follower')
            .skip(skip)
            .limit(take);

        return {
            status: 'ok',
            code: 200,
            data: {
                followers: result.map((item) => User.project(item.follower)),
            },
        };
    },
});

/**
 * @version v1.0.0
 * @method GET
 * @url /api/user/:id/followers
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/user/616f115feb325663f8bce3a4/followers
 *
 * @description This route is used to list all of the users that the requester is following.
 * */
registerRoute(router, '/:username/following', {
    method: 'get',
    params: UserByUsernameRequestSchema,
    query: z.object({ mode: ModeSchema }).merge(PaginationQuerySchema),
    headers: z.object({}),
    permissionVerification: verifyUserPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const user = await userUtils.transformUsernameIntoId(req);

        const { skip, take } = req.query;
        const result = await Follower.find({ follower: user.id })
            .populate<{ following: IUser }>('following')
            .skip(skip)
            .limit(take)
            .exec();

        return {
            status: 'ok',
            code: 200,
            data: {
                followers: result.map((item) => User.project(item.following)),
            },
        };
    },
});

export default router;
