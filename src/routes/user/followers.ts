import { z } from 'zod';
import express from 'express';
import Logger from '../../common/logger';
import * as error from '../../common/errors';
import Follower from '../../models/Follower';
import * as userUtils from '../../utils/users';
import registerRoute from '../../lib/requests';
import User, { IUser, IUserRole } from '../../models/User';
import { ModeSchema } from '../../validators/requests';

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
    params: z.object({ username: z.string() }),
    body: z.object({}),
    query: z.object({ mode: ModeSchema }),
    permission: { level: IUserRole.Default },
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        const { id: followerId } = req.requester;

        // check if the user is already following the other user, if so
        // then exit early and don't create the new follower link.
        const follower = await User.findById(followerId).exec();

        if (!follower) {
            return res.status(404).json({
                status: 'error',
                message: error.NON_EXISTENT_USER,
            });
        }

        // if the user is trying to follow itself
        // Just return a NoContent since we don't need to create anything
        if (follower.id === user.id) {
            return res.status(204).json({
                status: 'ok',
            });
        }

        let mapping = { follower: follower.id, following: user.id };

        // check if the user is already following, if so, exit early and return
        // corresponding messages
        const doc = await Follower.findOne(mapping).exec();

        if (doc) {
            return res.status(401).json({
                status: 'error',
                message: error.ALREADY_FOLLOWED,
            });
        }

        const newFollow = new Follower(mapping);
        try {
            newFollow.save();

            return res.status(201).json({
                status: 'ok',
                message: 'Successfully followed user.',
            });
        } catch (e) {
            Logger.error(e);

            return res.status(500).json({
                status: 'error',
                message: error.INTERNAL_SERVER_ERROR,
            });
        }
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
    params: z.object({ username: z.string() }),
    query: z.object({ mode: ModeSchema }),
    permission: { level: IUserRole.Default },
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        const { id: followerId } = req.requester;

        // check if the user is already following the other user, if so
        // then exit early and don't create the new follower link.
        const follower = await User.findById(followerId).exec();

        if (!follower) {
            return res.status(404).json({
                status: 'error',
                message: error.NON_EXISTENT_USER,
            });
        }

        await Follower.findOneAndDelete({
            follower: follower.id,
            following: user.id,
        }).exec();

        return res.status(200).json({
            status: 'ok',
            message: 'User was unfollowed',
        });
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
    params: z.object({ username: z.string() }),
    query: z.object({ mode: ModeSchema }),
    permission: { level: IUserRole.Default },
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        const { id: followerId } = req.requester;

        // check if the user is already following the other user, if so
        // then exit early and don't create the new follower link.
        const follower = await User.findById(followerId).exec();

        if (!follower) {
            return res.status(404).json({
                status: 'error',
                message: error.NON_EXISTENT_USER,
            });
        }

        const link = await Follower.findOne({
            follower: follower.id,
            following: user.id,
        }).exec();

        return res.status(200).json({
            status: 'ok',
            following: link !== null,
        });
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
    params: z.object({ username: z.string() }),
    query: z.object({ mode: ModeSchema }),
    permission: { level: IUserRole.Default },
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        // TODO:(alex) Implement pagination for this endpoint since the current limit will
        //             be 50 documents.
        // https://medium.com/swlh/mongodb-pagination-fast-consistent-ece2a97070f3
        const result = await Follower.find({ following: user.id })
            .populate<{ follower: IUser }[]>('follower')
            .limit(50);

        const followers = result.map((link) => User.project(link.follower as unknown as IUser));

        return res.status(200).json({
            status: 'ok',
            data: {
                followers,
            },
        });
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
    params: z.object({ username: z.string() }),
    query: z.object({ mode: ModeSchema }),
    permission: { kind: 'follower', level: IUserRole.Default },
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        // TODO:(alex) Implement pagination for this endpoint since the current limit will
        //             be 50 documents.
        // https://medium.com/swlh/mongodb-pagination-fast-consistent-ece2a97070f3
        const result = await Follower.find({ follower: user.id })
            .populate<{ following: IUser }[]>('following')
            .limit(50)
            .exec();

        const followers = result.map((link) => {
            return User.project(link.following as unknown as IUser);
        });

        return res.status(200).json({
            status: 'ok',
            data: {
                following: followers,
            },
        });
    },
});

export default router;
