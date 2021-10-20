import express from 'express';

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import User from '../models/User';
import Logger from '../common/logger';
import * as error from '../common/errors';
import { createTokens, ownerAuth } from '../auth';
import {
    IUserRegisterRequestSchema,
    IUserPatchRequestSchema,
    IUserPatchRequest,
    IUserLoginRequestSchema,
    IUserLoginRequest,
} from '../validators/user';
import paramValidator from '../validators/requests';

const router = express.Router();

/**
 * @version v1.0.0
 * @method POST
 * @url api/user/register
 * @example
 * https://af268.cs.st-andrews.ac.uk/api/user/register
 * >>> body: {
 *     "email": "feds01@gmail.com",
 *     "name": "feds01",
 *     "password": "Password2020"
 * }
 *
 * @description This route is used to sign-up new users to the journal, the route will
 * accept a username, email & password within the request body. The password will be checked
 * to match the security criterion. Rules include the password length being at least 8 characters
 * long. Furthermore, the email will be validated against a common Regular expression to ensure
 * that bogus emails are not provided. Once input validation is passed, a search within the database
 * for the provided 'email' & 'username' to ensure that they are not already registered to another
 * user account. If all checks pass, the provided password is hashed, user initialisation is carried
 * out and the user data entry is added to the database. The route will send a 'CREATED' response if it
 * successfully created a user account.
 *
 * @param {String} name: a string which will represent the abbreviated name of the user. This does not have
 *        to be unique.
 * @param {String} email: a string in the format of an email, this will be used to carry out security
 *        checks on the user account & user notifications.
 *
 * @param {String} password: a string which will be the used for logging in and confirming sensitive operations.
 *
 * @error {BAD_REQUEST} if password does not match the security criterion.
 * @error {BAD_REQUEST} if the username is a null string, or contains illegal characters.
 * @error {INVALID_EMAIL} if the provided email does not match a standard email schema.
 * @error {MAIL_EXISTS} if the provided email/username is already registered to a user in the system.
 *
 * @return response to client if user was created and added to the system.
 * */
router.post('/register', async (req, res) => {
    let response: IUserLoginRequest;

    try {
        response = await IUserRegisterRequestSchema.parseAsync(req.body);
    } catch (e: any) {
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

    const { password, email, username } = response;

    // generate the salt for the new user account;
    const salt = await bcrypt.genSalt();

    return bcrypt.hash(password, salt, async (err, hash) => {
        if (err) {
            Logger.error(err);

            return res.status(500).json({
                status: false,
                message: error.INTERNAL_SERVER_ERROR,
            });
        }

        // create the user object and save it to the table
        const newUser = new User({ email, password: hash, username });

        try {
            const savedUser = await newUser.save();

            const { token, refreshToken } = await createTokens({
                email,
                username,
                id: savedUser._id,
            });

            return res.status(201).json({
                status: true,
                message: 'Successfully created new user account.',
                username,
                email,
                token,
                refreshToken,
            });
        } catch (e) {
            Logger.error(e);

            return res.status(500).json({
                status: false,
                message: error.INTERNAL_SERVER_ERROR,
            });
        }
    });
});

/**
 * @version v1.0.0
 * @method POST
 * @url /api/user/login
 * @example
 * https://af268.cs.st-andrews.ac.uk/api/user/login
 * >>> body: {
 *     "email": "feds01@gmail.com",
 *     "password": "Password2020"
 * }
 * >>> response: {
 *  "status": "ok",
 *  "token": ...,
 *  "refreshToken": ...,
 *  "user": {
 *      ...
 *  }
 * }
 *
 * @description This route is used to login users into the journal, the route
 * will accept a username or email & password within the request body. The method will determine
 * which authentication strategy the request is using. If an email is provided, the user will
 * be authenticated using email, and vice versa for username. If a user is found with email/username,
 * the sent over password will be compared with stored hash. If hash and password match, the request
 * will create two request tokens 'x-token' and 'x-refresh-token' and apply them to response header.
 * Additionally, the 'last_login' column is updated, and a 'USER_LOGIN' event is added in user's timeline.
 *
 * @param {string} email: a string in the format of an email, this will be used to carry out security
 * checks on the user account & user notifications.
 *
 * @param {string} password: a string which will be the used for logging in and confirming sensitive operations.
 *
 * @error {BAD_REQUEST} if no email field is provided in the request
 * @error {BAD_REQUEST} if no password field was provided in the request
 * @error {UNAUTHORIZED} if password does not match hash
 * @error {AUTHENTICATION_FAILED} if the username/email do not exist within the database,
 *
 * @return sends a response to client if user successfully (or not) logged in.
 *
 * */
router.post('/login', async (req, res) => {
    let response: IUserLoginRequest;

    try {
        response = await IUserLoginRequestSchema.parseAsync(req.body);
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

    const { username, email, password } = response;

    // Use both fields to look for the login
    const searchQuery = {
        $or: [...(username ? [{ username }] : []), ...(email ? [{ email }] : [])],
    };

    const result = await User.findOne(searchQuery).exec();

    // Important to send an authentication failure request, rather than a
    // username not found. This could lead to a brute force attack to retrieve
    // all existent user names.
    if (result) {
        bcrypt.compare(password, result.password, async (err, response) => {
            if (err) {
                // Log the error in the server console & respond to the client with an
                // INTERNAL_SERVER_ERROR, since this was an unexpected exception.
                Logger.error(err);

                return res.status(500).json({
                    status: false,
                    message: error.INTERNAL_SERVER_ERROR,
                });
            }

            // If the sent over password matches the hashed password within the database, generate the
            // 'x-token' and 'x-refresh-token' JWT's . Also, update the 'last_login' timestamp and record
            // an entry for the user logging in into the system.
            if (response) {
                const { token, refreshToken } = await createTokens({
                    email: result.email,
                    name: result.username,
                    id: result._id,
                });

                // set the tokens in the response headers
                res.set('Access-Control-Expose-Headers', 'x-token, x-refresh-token');
                res.set('x-token', token);
                res.set('x-refresh-token', refreshToken);

                return res.status(302).json({
                    status: true,
                    message: 'Authentication successful',
                    user: User.project(result),
                    token,
                    refreshToken,
                });
            }
            // password did not match the stored hashed password within the database
            return res.status(401).json({
                status: false,
                message: error.BAD_REQUEST,
                extra: error.MISMATCHING_LOGIN,
            });
        });
    } else {
        return res.status(401).json({
            status: false,
            message: error.AUTHENTICATION_FAILED,
            extra: error.MISMATCHING_LOGIN,
        });
    }
});

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
router.get('/:id', paramValidator, ownerAuth, async (req, res) => {
    const { id } = req.params; // const id = req.params.id;

    User.findById(id, {}, {}, (err, user) => {
        // If the user wasn't found, then return a not found status.
        if (!user) {
            return res.status(404).json({
                status: false,
                message: 'No user with given id exists',
            });
        }

        return res.status(200).json({
            status: true,
            user: User.project(user),
        });
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
router.patch('/:id', paramValidator, ownerAuth, async (req, res) => {
    const { id } = req.params;

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
    User.findOneAndUpdate({ _id: id }, update, queryOptions, (err, newUser) => {
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
 * The route will delete any lobbies that the player has initiated, and likely in
 * the future any archived games.
 *
 * @error {UNAUTHORIZED} if the request does not contain a token or refreshToken
 *
 * @return sends a response to client if user was successfully deleted or not.
 * */

router.delete('/:id', paramValidator, ownerAuth, async (req, res) => {
    const { id } = req.params;

    // find all the games that are owned by the current player.
    User.findOneAndDelete({ _id: id }, {}, (err) => {
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

export default router;
