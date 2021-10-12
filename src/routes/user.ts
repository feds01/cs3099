import express from 'express';
import {createTokens, refreshTokens, ownerAuth} from "../auth";

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
 router.post("/login", async (req, res) => {
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
router.get("/", ownerAuth, async (req, res) => {
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
router.patch("/", ownerAuth, async (req, res) => {
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
router.delete("/", ownerAuth, async (req, res) => {
});

export default router;
