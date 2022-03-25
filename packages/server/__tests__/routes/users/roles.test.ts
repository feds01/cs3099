import assert from 'assert';
import { agent as supertest } from 'supertest';

import app from '../../../src/app';
import User, { IUserRole } from '../../../src/models/User';
import UserModel from '../../../src/models/User';
import { createMockedUser } from '../../utils/factories/user';

const request = supertest(app);

describe('User role tests', () => {
    const UserObject = {
        email: 'test@email.com',
        username: 'test',
        name: 'test',
        password: 'password',
        about: 'Nothing to say',
    };

    // Test account that will be used as the requester
    const userDto = createMockedUser({ username: 'a-user' });

    // Create a user test account before any test is run
    beforeEach(async () => {
        const registerResponse = await request.post('/auth/register').send(UserObject);
        expect(registerResponse.status).toBe(201);

        const registerOther = await request.post('/auth/register').send(userDto);
        expect(registerOther.status).toBe(201);
    });

    afterEach(async () => {
        // Sign into userDto (as an admin), delete both accounts created for testing
        const loginOther = await request.post('/auth/login').send({
            username: userDto.username,
            password: userDto.password,
        });
        expect(loginOther.status).toBe(200);
        await User.findOneAndUpdate(
            { username: userDto.username },
            { role: IUserRole.Administrator },
        );

        const registerResponse = await request.delete(`/user/${UserObject.username}`);
        expect(registerResponse.status).toBe(200);

        const registerOther = await request.delete(`/user/${userDto.username}`);
        expect(registerOther.status).toBe(200);
    });

    it('should fail to update other users profile avatar', async () => {
        const loginOther = await request.post('/auth/login').send({
            username: userDto.username,
            password: userDto.password,
        });
        expect(loginOther.status).toBe(200);

        request.auth(loginOther.body.token, { type: 'bearer' });
        request.set({ 'x-refresh-token': loginOther.body.refreshToken });

        // Verify that the 'test' account exists
        const userQuery = await UserModel.findOne({ username: 'test' });
        expect(userQuery).not.toBeNull();

        const avatarUpload = await request
            .post('/resource/upload/test')
            .attach('file', '__tests__/resources/logo.png');

        expect(avatarUpload.status).toBe(401);
    });

    it('should fail to update other users profile details', async () => {
        const loginOther = await request.post('/auth/login').send({
            username: userDto.username,
            password: userDto.password,
        });

        expect(loginOther.status).toBe(200);

        request.auth(loginOther.body.token, { type: 'bearer' });
        request.set({ 'x-refresh-token': loginOther.body.refreshToken });

        const { email, username, name, about } = createMockedUser();
        const requestDto = { email, username, name, about };

        const response = await request.patch('/user/test').send(requestDto);
        expect(response.status).toBe(401);
    });

    // Tests for PATCH /user/:username
    it('moderators can update other account personal info', async () => {
        await User.findOneAndUpdate({ username: userDto.username }, { role: IUserRole.Moderator });
        const loginOther = await request.post('/auth/login').send({
            username: userDto.username,
            password: userDto.password,
        });
        request.auth(loginOther.body.token, { type: 'bearer' });
        request.set({ 'x-refresh-token': loginOther.body.refreshToken });

        const { email, username, name, about } = createMockedUser();
        const requestDto = { email, username, name, about };

        // call API to patch user details
        const response = await request.patch('/user/test').send(requestDto);
        expect(response.status).toBe(200);

        // find user with new username
        const user = await User.findOne({ username: requestDto.username });
        expect(user).toMatchObject(requestDto);

        // reset username and email (for the purpose of further testing)
        assert(user !== null);
        await user.updateOne({ email: UserObject.email, username: UserObject.username }).exec();
    });

    it('administrators can update other account personal info', async () => {
        await User.findOneAndUpdate(
            { username: userDto.username },
            { role: IUserRole.Administrator },
        );
        const loginOther = await request.post('/auth/login').send({
            username: userDto.username,
            password: userDto.password,
        });
        request.auth(loginOther.body.token, { type: 'bearer' });
        request.set({ 'x-refresh-token': loginOther.body.refreshToken });

        const { email, username, name, about } = createMockedUser();
        const requestDto = { email, username, name, about };

        // call API to patch user details
        const response = await request.patch('/user/test').send(requestDto);
        expect(response.status).toBe(200);

        // find user with new username
        const user = await User.findOne({ username: requestDto.username });
        expect(user).toMatchObject(requestDto);

        // reset username and email (for the purpose of further testing)
        assert(user !== null);
        await user.updateOne({ email: UserObject.email, username: UserObject.username }).exec();
    });

    // Tests for DELETE /user/:username
    it('user should fail to delete other users account', async () => {
        const loginOther = await request.post('/auth/login').send({
            username: userDto.username,
            password: userDto.password,
        });

        expect(loginOther.status).toBe(200);

        request.auth(loginOther.body.token, { type: 'bearer' });
        request.set({ 'x-refresh-token': loginOther.body.refreshToken });

        const response = await request.delete('/user/test');
        expect(response.status).toBe(401);
    });

    it('moderator should fail to delete other users account', async () => {
        await User.findOneAndUpdate({ username: userDto.username }, { role: IUserRole.Moderator });
        const loginOther = await request.post('/auth/login').send({
            username: userDto.username,
            password: userDto.password,
        });

        expect(loginOther.status).toBe(200);

        request.auth(loginOther.body.token, { type: 'bearer' });
        request.set({ 'x-refresh-token': loginOther.body.refreshToken });

        // Expect delete to fail
        const response = await request.delete('/user/test');
        expect(response.status).toBe(401);
    });

    it('administrator can delete other users account', async () => {
        await User.findOneAndUpdate(
            { username: userDto.username },
            { role: IUserRole.Administrator },
        );
        const loginOther = await request.post('/auth/login').send({
            username: userDto.username,
            password: userDto.password,
        });

        expect(loginOther.status).toBe(200);

        request.auth(loginOther.body.token, { type: 'bearer' });
        request.set({ 'x-refresh-token': loginOther.body.refreshToken });

        // Expect delete to be success
        const response = await request.delete('/user/test');
        expect(response.status).toBe(200);

        // Expect creating account with same details to succeed
        const registerResponse = await request.post('/auth/register').send(UserObject);
        expect(registerResponse.status).toBe(201);
    });
});
