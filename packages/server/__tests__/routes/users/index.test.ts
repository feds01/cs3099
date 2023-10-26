import faker from '@faker-js/faker';
import { describe, expect, it } from '@jest/globals';
import assert from 'assert';
import mongoose from 'mongoose';
import { agent as supertest } from 'supertest';

import app from '../../../src/app';
import User, { IUserRole } from '../../../src/models/User';

const request = supertest(app);

describe('User endpoint tests ', () => {
    let testUserId: string;

    // create a user and login before all tests
    it('should create a user', async () => {
        // call register api
        const registerRespoinse = await request.post('/auth/register').send({
            email: 'test@email.com',
            username: 'test',
            name: 'test',
            password: 'Passwordexample123!',
            about: 'Nothing to say',
            profilePictureUrl: 'https://nothing-to-show.com',
        });

        // expect register to be successful
        expect(registerRespoinse.status).toBe(201);

        // update the user role to be administrator
        await User.findOneAndUpdate({ username: 'test' }, { role: IUserRole.Administrator });

        // call login api with wrong password
        const loginResponseFail = await request.post('/auth/login').send({
            username: 'test',
            password: 'badPassword',
        });
        expect(loginResponseFail.status).toBe(401);

        // call login api with username
        const loginResponse = await request.post('/auth/login').send({
            username: 'test',
            password: 'Passwordexample123!',
        });

        // expect login with username successfully
        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body.token).toBeDefined();
        expect(loginResponse.body.refreshToken).toBeDefined();

        // call login api with email
        const loginResponseEmail = await request.post('/auth/login').send({
            username: 'test@email.com',
            password: 'Passwordexample123!',
        });

        // expect login with email to be sucessfull
        expect(loginResponseEmail.status).toBe(200);
        expect(loginResponseEmail.body.token).toBeDefined();
        expect(loginResponseEmail.body.refreshToken).toBeDefined();

        // set the bearer token and refresh token
        request.auth(loginResponse.body.token, { type: 'bearer' });
        request.set({ 'x-refresh-token': loginResponse.body.refreshToken });

        testUserId = loginResponse.body.user.id;
    });

    // Tests for POST /auth/register

    // fail to create a user with no username
    it('should fail to create a user with no username', async () => {
        // call register api without username field
        const registerNewResponse = await request.post('/auth/register').send({
            email: 'test@email.com',
            name: 'newtest',
            password: 'Passwordexample123!',
            about: 'Nothing to say',
            profilePictureUrl: 'https://nothing-to-show.com',
        });

        // expect register to fail
        expect(registerNewResponse.status).toBe(400);
    });

    // fail to create a user with no password
    it('should fail to create a user with no password', async () => {
        // call register api without password field
        const registerNewResponse = await request.post('/auth/register').send({
            email: 'test@email.com',
            username: 'newtest',
            name: 'newtest',
            about: 'Nothing to say',
            profilePictureUrl: 'https://nothing-to-show.com',
        });

        // expect register to fail
        expect(registerNewResponse.status).toBe(400);
    });

    // fail to create a user when username or email already taken
    it('should fail to create a user when username taken', async () => {
        // call register api with an inuse username
        const registerUserTaken = await request.post('/auth/register').send({
            email: 'test2@email.com',
            username: 'test',
            name: 'newtest',
            password: 'Passwordexample123!',
            about: 'Nothing to say',
            profilePictureUrl: 'https://nothing-to-show.com',
        });

        // expect register to fail
        expect(registerUserTaken.status).toBe(400);

        // call register api with an inuse email
        const registerEmailTaken = await request.post('/auth/register').send({
            email: 'test@email.com',
            username: 'test2',
            name: 'newtest2',
            password: 'Passwordexample123!',
            about: 'Nothing to say',
            profilePictureUrl: 'https://nothing-to-show.com',
        });

        // expect register to fail
        expect(registerEmailTaken.status).toBe(400);
    });

    // Tests for  GET /user/:username

    it('Getting Non-existing user with name', async () => {
        const response = await request.get('/user/notexist');
        expect(response.status).toBe(404);
    });

    it('Getting existing user with name', async () => {
        const response = await request.get('/user/test');
        expect(response.status).toBe(200);
    });

    it('Getting user with wrong id', async () => {
        const response = await request.get('/user/61843532859294ee3816fa74?mode=id');
        expect(response.status).toBe(404);
    });

    it('Getting user with correct id', async () => {
        const response = await request.get(`/user/${testUserId}?mode=id`);
        expect(response.status).toBe(200);
    });

    // Tests for PATCH /user/:username

    it("Updating user and check if user's information is updated", async () => {
        // call API to patch user details
        const response = await request.patch('/user/test').send({
            email: 'testUPDATED@email.com',
            username: 'testUPDATED',
            name: 'testUPDATED',
            about: 'Something to say',
        });

        // expect patch to succeed
        expect(response.status).toBe(200);

        // find user with new username
        const user = await User.findOne({ username: 'testUPDATED' });

        // expect all updated to be correct
        expect(user?.email).toBe('testUPDATED@email.com');
        expect(user?.username).toBe('testUPDATED');
        expect(user?.name).toBe('testUPDATED');
        expect(user?.about).toBe('Something to say');

        // reset username and email (for the purpose of further testing)
        const reset = await request.patch('/user/testUPDATED').send({
            email: 'test@email.com',
            username: 'test',
        });
        expect(reset.status).toBe(200);
    });

    // Tests for PATCH /user/:username/role

    it("Updating user's role is disallowed", async () => {
        const response = await request.patch('/user/test/role').send({
            role: IUserRole.Default,
        });
        expect(response.status).toBe(400);

        const user = await User.findOne({ username: 'test' });
        expect(user?.role).toBe(IUserRole.Administrator);
    });

    it("Updating user's role using default privilege and check if it fails", async () => {
        const response = await request.patch('/user/test/role').send({
            role: IUserRole.Administrator,
        });
        expect(response.status).toBe(400);
    });

    // delete the test user after all tests
    it('should delete the test user', async () => {
        // call delete user api
        const deleteUserResponse = await request.delete('/user/test');

        // expect delete to be successful
        expect(deleteUserResponse.status).toBe(200);
    });
});
