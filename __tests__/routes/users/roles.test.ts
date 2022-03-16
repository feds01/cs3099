import { agent as supertest } from 'supertest';

import app from '../../../src/app';
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
    beforeAll(async () => {
        const registerResponse = await request.post('/auth/register').send(UserObject);
        expect(registerResponse.status).toBe(201);

        const registerOther = await request.post('/auth/register').send(userDto);
        expect(registerOther.status).toBe(201);
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
        
        const deleteMockUser = await request.delete(`/user/${userDto.username}`);
        expect(deleteMockUser.status).toBe(200);
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

        const deleteMockUser = await request.delete(`/user/${userDto.username}`);
        expect(deleteMockUser.status).toBe(200);
    });
});
