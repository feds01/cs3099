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

        // call login api
        const loginResponse = await request.post('/auth/login').send({
            username: 'test',
            password: 'Passwordexample123!',
        });

        // expect login successfully
        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body.token).toBeDefined();
        expect(loginResponse.body.refreshToken).toBeDefined();

        // set the bearer token and refresh token
        request.auth(loginResponse.body.token, { type: 'bearer' });
        request.set({ 'x-refresh-token': loginResponse.body.refreshToken });

        testUserId = loginResponse.body.user.id;
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
        const response = await request.patch('/user/test').send({
            name: 'tset',
            about: 'Something to say',
        });

        expect(response.status).toBe(200);

        const user = await User.findOne({ username: 'test' });

        expect(user?.name).toBe('tset');
        expect(user?.about).toBe('Something to say');
    });

    // Tests for PATCH /user/:username/role

    it("Updating user's role to default and check if user's role is updated", async () => {
        const response = await request.patch('/user/test/role').send({
            role: IUserRole.Default,
        });
        expect(response.status).toBe(200);

        const user = await User.findOne({ username: 'test' });
        expect(user?.role).toBe(IUserRole.Default);
    });

    it("Updating user's role using default privilege and check if it fails", async () => {
        const response = await request.patch('/user/test/role').send({
            role: IUserRole.Administrator,
        });
        expect(response.status).toBe(401);
    });

    // delete the test user after all tests
    it('should delete the test user', async () => {
        // call delete user api
        const deleteUserResponse = await request.delete('/user/test');

        // expect delete to be successful
        expect(deleteUserResponse.status).toBe(200);
    });
});
