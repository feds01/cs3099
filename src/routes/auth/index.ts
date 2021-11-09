import { z, ZodError } from 'zod';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import express from 'express';
import User from '../../models/User';
import Logger from '../../common/logger';
import { config } from "./../../server";
import * as error from '../../common/errors';
import {
    IEmailValidity,
    IEmailValiditySchema,
    IUsernameValidity,
    IUsernameValiditySchema,
} from '../../validators/auth';
import { createTokens } from '../../lib/auth';
import {
    IUserLoginRequest,
    IUserLoginRequestSchema,
    IUserRegisterRequest,
    IUserRegisterRequestSchema,
} from '../../validators/user';
import registerRoute from '../../lib/requests';
import State from '../../models/State';

const router = express.Router();

/**
 * @version v1.0.0
 * @method GET
 * @url /api/auth/username_validity
 * @example
 * https://af268.cs.st-andrews.ac.uk/api/auth/username_validity
 *
 * >>> response:
 * {
 *  "status": "true",
 *  "message": "Username exists"
 * }
 *
 * @description This route is used to determine if a username is already in use, the route
 * will accept a token in the header of the request to authenticate the request.
 *
 * @error {UNAUTHORIZED} if the request does not contain a token or refreshToken
 *
 * @return sends a response to client if user successfully (or not) logged in. The response contains
 * whether username is in use.
 *
 * */
router.get('/username_validity', async (req, res) => {
    let request: IUsernameValidity;

    try {
        request = IUsernameValiditySchema.parse(req.body);
    } catch (e) {
        if (e instanceof ZodError) {
            return res.status(400).json({
                status: "error",
                message: error.BAD_REQUEST,
                errors: e.errors,
            });
        }

        Logger.error(e);
        return res.status(500).json({
            status: "error",
            message: error.INTERNAL_SERVER_ERROR,
        });
    }

    const result = await User.findOne({ username: request.username }).exec();

    // If the user wasn't found, then return a not found status.
    if (!result) {
        return res.status(200).json({
            status: "error",
            message: 'No user with given username exists',
        });
    }

    // Unprocessable entity
    return res.status(422).json({
        status: "ok",
        message: 'Username exists',
    });
});

/**
 * @version v1.0.0
 * @method GET
 * @url /api/auth/email_validity
 * @example
 * https://af268.cs.st-andrews.ac.uk/api/auth/email_validitiy
 *
 * >>> response:
 * {
 *  "status": "true",
 *  "message": "Email exists"
 * }
 *
 * @description This route is used to determine if an email address is already in use, the route
 * will accept a token in the header of the request to authenticate the request.
 *
 * @error {UNAUTHORIZED} if the request does not contain a token or refreshToken
 *
 * @return sends a response to client if user successfully (or not) logged in. The response contains
 * whether the email is in use.
 *
 * */
router.get('/email_validity', async (req, res) => {
    let request: IEmailValidity;

    try {
        request = IEmailValiditySchema.parse(req.body);
    } catch (e) {
        if (e instanceof ZodError) {
            return res.status(400).json({
                status: "error",
                message: error.BAD_REQUEST,
                errors: e.errors,
            });
        }

        Logger.error(e);
        return res.status(500).json({
            status: "error",
            message: error.INTERNAL_SERVER_ERROR,
        });
    }

    const result = await User.findOne({ 
        email: request.email, 
        externalId: { $exists: false } 
    }).exec();

    // If the email wasn't found, then return a not found status.
    if (!result) {
        return res.status(404).json({
            status: "ok",
            message: 'Email address not in use',
        });
    }

    // Unprocessable Entity
    return res.status(422).json({
        status: "ok",
        message: 'Email exists',
    });
});


/**
 * @version v1.0.0
 * @method GET
 * @url /api/auth/sso
 * @example
 * https://af268.cs.st-andrews.ac.uk/api/auth/sso
 * 
 * @description This route is used to internally send of a request to sign on with a different 
 * service instead of using the internal login process. It accepts a `to` url in the body which 
 * is the service that the user selects to login as, and a path which is an optional path
 * that the user tries to internally sign-in before hitting the login screen. The optional
 * path can be used to re-direct the user back to the page once they've signed up and redirected
 * back.
 * 
 */
registerRoute(router, "/sso", {
    method: "post",
    permission: null,
    query: z.object({ to: z.string().url(), path: z.string().optional() }),
    params: z.object({}),
    body: z.object({}),
    handler: async (req, res) => {
        const { to, path } = req.query;

        // @@Security: assert that the to URL is valid and exists in the supergroup service map.

        // create a new state using nano-id for url safe random strings
        const stateString = nanoid();

        const state = new State({
            state: stateString,
            from: to,
            path: path ?? "/" // re-direct the user back to / if the path isn't provided.
        })

        await state.save();

        // re-direct the user to the external service to begin the sso process...
        const url = new URL(`/api/sg/sso/login?state=${stateString}&from=${config.frontendURI}`, to);
        console.log(url.toString());
        res.redirect(url.toString());
    }
});

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
    let response: IUserRegisterRequest;

    try {
        response = await IUserRegisterRequestSchema.parseAsync(req.body);
    } catch (e: any) {
        if (e instanceof ZodError) {
            return res.status(400).json({
                status: "error",
                message: error.BAD_REQUEST,
                errors: e.errors,
            });
        }

        Logger.error(e);
        return res.status(500).json({
            status: "error",
            message: error.INTERNAL_SERVER_ERROR,
        });
    }

    const { password, email, username } = response;

    // Check if username or email is already in use

    const searchQueryUser = {
        $or: [{ username }, { email, externalId: { $exists: false } }],
    };

    const resultUser = await User.findOne(searchQueryUser).exec();

    if (resultUser) {
        if (resultUser.username === username) {
            return res.status(409).json({
                status: "error",
                message: error.REGISTRATION_FAILED,
                extra: error.USER_EXISTS,
            });
        }
        if (resultUser.email === email) {
            return res.status(409).json({
                status: "error",
                message: error.REGISTRATION_FAILED,
                extra: error.MAIL_EXISTS,
            });
        }
    }

    // generate the salt for the new user account;
    const salt = await bcrypt.genSalt();

    return bcrypt.hash(password, salt, async (err, hash) => {
        if (err) {
            Logger.error(err);

            return res.status(500).json({
                status: "error",
                message: error.INTERNAL_SERVER_ERROR,
            });
        }

        // create the user object and save it to the table
        const newUser = new User({ ...response, password: hash });

        try {
            const savedUser = await newUser.save();

            const { token, refreshToken } = await createTokens({
                email,
                username,
                id: savedUser.id,
            });

            return res.status(201).json({
                status: "ok",
                message: 'Successfully created new user account.',
                username,
                email,
                token,
                refreshToken,
            });
        } catch (e) {
            Logger.error(e);

            return res.status(500).json({
                status: "error",
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
                status: "error",
                message: error.BAD_REQUEST,
                errors: e.errors,
            });
        }

        Logger.error(e);
        return res.status(500).json({
            status: "error",
            message: error.INTERNAL_SERVER_ERROR,
        });
    }

    const { username, password, isEmail } = response;

    const searchQuery = isEmail ? { email: username } : { username };
    const result = await User.findOne({ ...searchQuery, externalId: { $exists: false } }).exec();

    // Important to send an authentication failure request, rather than a
    // username not found. This could lead to a brute force attack to retrieve
    // all existent user names.
    if (result) {
        return bcrypt.compare(password, result.password, async (err, response) => {
            if (err) {
                // Log the error in the server console & respond to the client with an
                // INTERNAL_SERVER_ERROR, since this was an unexpected exception.
                Logger.error(err);

                return res.status(500).json({
                    status: "error",
                    message: error.INTERNAL_SERVER_ERROR,
                });
            }

            // If the sent over password matches the hashed password within the database, generate the
            // token and refreshToken JWT's . Also, update the 'last_login' timestamp and record
            // an entry for the user logging in into the system.
            if (response) {
                const { token, refreshToken } = createTokens({
                    email: result.email,
                    username: result.username,
                    id: result.id,
                });

                return res.status(200).json({
                    status: "ok",
                    message: 'Authentication successful',
                    user: User.project(result),
                    token,
                    refreshToken,
                });
            }
            // password did not match the stored hashed password within the database
            return res.status(401).json({
                status: "error",
                message: error.AUTHENTICATION_FAILED,
                extra: error.MISMATCHING_LOGIN,
            });
        });
    } else {
        return res.status(401).json({
            status: "error",
            message: error.AUTHENTICATION_FAILED,
            extra: error.MISMATCHING_LOGIN,
        });
    }
});

export default router;
