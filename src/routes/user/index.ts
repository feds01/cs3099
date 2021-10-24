import express from 'express';

import mongoose from 'mongoose';
import { ZodError } from 'zod';
import User from '../../models/User';
import Logger from '../../common/logger';
import * as error from '../../common/errors';
import followerRouter from './followers';
import { ownerAuth, adminAuth } from '../../auth';
import {
    IUserPatchRequestSchema,
    IUserPatchRequest,
    IUserRoleRequestSchema,
    IUserRoleRequest,
} from '../../validators/user';
import paramValidator from '../../validators/requests';

const router = express.Router();

// Register the follower routes
router.use('/:username/follow*', followerRouter);

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
router.get('/:username', ownerAuth, async (req, res) => {
    const { username } = req.params; // const id = req.params.id;

    const user = await User.findOne({ username }).exec();

    // If the user wasn't found, then return a not found status.
    if (!user) {
        return res.status(404).json({
            status: false,
            message: error.NON_EXISTENT_USER,
        });
    }

    return res.status(200).json({
        status: true,
        user: User.project(user),
    });
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
router.patch('/:username', paramValidator, ownerAuth, async (req, res) => {
    const { username } = req.params;

    let response: IUserPatchRequest;

    try {
        response = await IUserPatchRequestSchema.parseAsync(req.body);
    } catch (e) {
        if (e instanceof ZodError) {
            return res.status(400).json({
                status: false,
                message: error.BAD_REQUEST,
                errors: e.errors,
            });
        }
        Logger.error(e);

        return res.status(500).json({
            status: false,
            message: error.INTERNAL_SERVER_ERROR,
        });
    }

    const update = { $set: { ...response } };
    const queryOptions = { new: true }; // new as in return the updated document

    // So take the fields that are to be updated into the set request, it's okay to this because
    // we validated the request previously and we should be able to add all of the fields into the
    // database. If the user tries to update the username or an email that's already in use, mongo
    // will return an error because these fields have to be unique.
    User.findOneAndUpdate({ username }, update, queryOptions, (err, newUser) => {
        if (err) {
            if (err instanceof mongoose.Error.ValidationError) {
                return res.status(400).json({
                    status: false,
                    message: error.BAD_REQUEST,
                    extra: err.errors,
                });
            }

            // Something went wrong...
            Logger.error(err);
            return res.status(500).json({
                status: false,
                message: error.INTERNAL_SERVER_ERROR,
            });
        }

        // If we couldn't find the user.
        if (!newUser) {
            return res.status(404).json({
                status: false,
                message: error.NON_EXISTENT_USER,
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Successfully updated user details.',
            user: User.project(newUser),
        });
    });
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

router.delete('/:username', paramValidator, ownerAuth, async (req, res) => {
    const { username } = req.params;

    User.findOneAndDelete({ username }, {}, (err) => {
        if (err) {
            Logger.error(err);

            return res.status(500).json({
                status: true,
                message: error.INTERNAL_SERVER_ERROR,
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Successfully deleted user account.',
        });
    });
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
router.get('/:username/role', paramValidator, adminAuth, async (req, res) => {
    const { username } = req.params; // const id = req.params.id;

    const user = await User.findOne({ username }).exec();

    // If the user wasn't found, then return a not found status.
    if (!user) {
        return res.status(404).json({
            status: false,
            message: error.NON_EXISTENT_USER_ID,
        });
    }

    return res.status(200).json({
        status: true,
        role: user.role,
    });
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
router.patch('/:username/role', paramValidator, adminAuth, async (req, res) => {
    const { username } = req.params;

    let response: IUserRoleRequest;

    try {
        response = await IUserRoleRequestSchema.parseAsync(req.body);
    } catch (e) {
        if (e instanceof ZodError) {
            return res.status(400).json({
                status: false,
                message: error.BAD_REQUEST,
                errors: e.errors,
            });
        }
        Logger.error(e);

        return res.status(500).json({
            status: false,
            message: error.INTERNAL_SERVER_ERROR,
        });
    }

    const update = { $set: { ...response } };

    User.findOneAndUpdate({ username }, update, { new: true }, (err, newUser) => {
        if (err) {
            if (err instanceof mongoose.Error.ValidationError) {
                return res.status(400).json({
                    status: false,
                    message: error.BAD_REQUEST,
                    extra: err.errors,
                });
            }

            // Something went wrong...
            Logger.error(err);
            return res.status(500).json({
                status: false,
                message: error.INTERNAL_SERVER_ERROR,
            });
        }

        // If we couldn't find the user.
        if (!newUser) {
            return res.status(404).json({
                status: false,
                message: error.NON_EXISTENT_USER_ID,
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Successfully updated user role.',
            role: newUser.role,
        });
    });
});

export default router;
