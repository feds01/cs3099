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

    // Create a user test account before any test is run
    beforeAll(async () => {
        const registerResponse = await request.post('/auth/register').send(UserObject);
        expect(registerResponse.status).toBe(201);
    });

    it('should fail to update other users profile avatar', async () => {
        const userDto = createMockedUser({ username: 'a-user' });

        const registerOther = await request.post('/auth/register').send(userDto);
        expect(registerOther.status).toBe(201);

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
});
