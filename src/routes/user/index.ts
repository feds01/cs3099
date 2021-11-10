import { z } from 'zod';
import express from 'express';
import mongoose from 'mongoose';
import Logger from '../../common/logger';
import followerRouter from './followers';
import reviewRouter from './reviews';
import * as error from '../../common/errors';
import Follower from '../../models/Follower';
import * as userUtils from './../../utils/users';
import User, { IUserRole } from '../../models/User';
import registerRoute from '../../lib/requests';
import { IUserPatchRequestSchema, IUserRoleRequestSchema } from '../../validators/user';
import { ModeSchema } from '../../validators/requests';

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
 * https://af268.cs.st-andrews.ac.uk/api/user
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
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        // we want to count the followers of the user and following entries
        // @@Performance: Maybe in the future store these numbers and update them when follow/unfollow events occur
        const followingCount = await Follower.count({ follower: user.id }).exec();
        const followerCount = await Follower.count({ following: user.id }).exec();

        return res.status(200).json({
            status: 'ok',
            user: User.project(user),
            follows: {
                followers: followerCount,
                following: followingCount,
            },
        });
    },
});

/**
 * @version v1.0.0
 * @method PATCH
 * @url /api/user
 * @example
 * https://af268.cs.st-andrews.ac.uk/api/user
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
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        const response = req.body;
        const update = { $set: { ...response } };
        const queryOptions = { new: true }; // new as in return the updated document

        // So take the fields that are to be updated into the set request, it's okay to this because
        // we validated the request previously and we should be able to add all of the fields into the
        // database. If the user tries to update the username or an email that's already in use, mongo
        // will return an error because these fields have to be unique.
        User.findByIdAndUpdate(user.id, update, queryOptions, (err, newUser) => {
            if (err) {
                if (err instanceof mongoose.Error.ValidationError) {
                    return res.status(400).json({
                        status: 'error',
                        message: error.BAD_REQUEST,
                        extra: err.errors,
                    });
                }

                // Something went wrong...
                Logger.error(err);
                return res.status(500).json({
                    status: 'error',
                    message: error.INTERNAL_SERVER_ERROR,
                });
            }

            // If we couldn't find the user.
            if (!newUser) {
                return res.status(404).json({
                    status: 'error',
                    message: error.NON_EXISTENT_USER,
                });
            }

            return res.status(200).json({
                status: 'ok',
                message: 'Successfully updated user details.',
                user: User.project(newUser),
            });
        });
    },
});

/**
 * @version v1.0.0
 * @method DELETE
 * @url /api/user
 * @example
 * https://af268.cs.st-andrews.ac.uk/api/user
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
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        const deletedUser = await User.findByIdAndDelete(user.id).exec();

        if (!deletedUser) {
            return res.status(404).json({
                status: 'error',
                message: error.NON_EXISTENT_USER,
            });
        }

        // Now we need to delete any follower entries that contain the current user's id
        await Follower.deleteMany({ $or: [{ following: user.id }, { follower: user.id }] }).exec();

        return res.status(200).json({
            status: 'ok',
            message: 'Successfully deleted user account.',
        });
    },
});

/**
 * @version v1.0.0
 * @method GET
 * @url /api/user/<id>/role
 * @example
 * https://af268.cs.st-andrews.ac.uk/api/user/<616f115feb505663f8bce3e2>/role
 * >>> response: {
 *  "status": "true",
 *  "role": "default" // TO CHECK
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
    permission: IUserRole.Administrator,
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        return res.status(200).json({
            status: 'ok',
            role: user.role,
        });
    },
});

/**
 * @version v1.0.0
 * @method PATCH
 * @url /api/user/<id>/role
 * @example
 * https://af268.cs.st-andrews.ac.uk/api/user/<616f115feb505663f8bce3e2>/role
 * >>> body:
 * {
 *  "role": "moderator"
 * }
 *
 * >>> response:
 * {
 *  "message": "Successfully updated user role",
 *  "user": {
 *      "role": "moderator"
 *  }
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
    permission: IUserRole.Administrator,
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        const update = { $set: { ...req.body } };

        User.findByIdAndUpdate(user.id, update, { new: true }, (err, newUser) => {
            if (err) {
                if (err instanceof mongoose.Error.ValidationError) {
                    return res.status(400).json({
                        status: 'error',
                        message: error.BAD_REQUEST,
                        extra: err.errors,
                    });
                }

                // Something went wrong...
                Logger.error(err);
                return res.status(500).json({
                    status: 'error',
                    message: error.INTERNAL_SERVER_ERROR,
                });
            }

            // If we couldn't find the user.
            if (!newUser) {
                return res.status(404).json({
                    status: 'error',
                    message: error.NON_EXISTENT_USER,
                });
            }

            return res.status(200).json({
                status: 'ok',
                message: 'Successfully updated user role.',
                role: newUser.role,
            });
        });
    },
});

export default router;
