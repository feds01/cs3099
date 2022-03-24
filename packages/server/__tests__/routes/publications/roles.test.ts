import { agent as supertest } from 'supertest';

import app from '../../../src/app';
import User, { IUserRole } from '../../../src/models/User';
import { createMockedPublication } from '../../utils/factories/publication';
import { createMockedUser } from '../../utils/factories/user';

const request = supertest(app);

describe('Publication role tests', () => {
    // Test account
    const UserObject = createMockedUser({ username: 'test' });

    // Test account that will be used as the requester
    const userDto = createMockedUser({ username: 'a-user' });

    // Test publication
    const testPub = createMockedPublication();

    // Create a user test account before any test is run
    beforeEach(async () => {
        // Register a main user (ie author of publications)
        const registerResponse = await request.post('/auth/register').send(UserObject);
        expect(registerResponse.status).toBe(201);

        // Login as user
        const loginUser = await request.post('/auth/login').send({
            username: UserObject.username,
            password: UserObject.password,
        });

        expect(loginUser.status).toBe(200);

        // Create publication as main user
        const response = await request
            .post('/publication/')
            .auth(loginUser.body.token, { type: 'bearer' })
            .send(testPub);
        expect(response.status).toBe(201);

        // Register an 'other' user
        const registerOther = await request.post('/auth/register').send(userDto);
        expect(registerOther.status).toBe(201);

        // Save auth header
        request.auth(registerOther.body.token, { type: 'bearer' });
        request.set({ 'x-refresh-token': registerOther.body.refreshToken });
    });

    afterEach(async () => {
        // After each test, an admin will delete the mock accounts

        // Make the user an administrator (in order to delete other accounts)
        await User.findOneAndUpdate(
            { username: userDto.username },
            { role: IUserRole.Administrator },
        );

        // Delete other account
        const registerResponse = await request.delete(`/user/${UserObject.username}`);
        expect(registerResponse.status).toBe(200);

        // Delete own account
        const registerOther = await request.delete(`/user/${userDto.username}`);
        expect(registerOther.status).toBe(200);
    });

    it('should handle unauthorised publication edit request', async () => {
        // Send patch request
        const responsePatch = await request.patch(`/publication/test/Publication-Test`).send({
            revision: 'v2',
            title: 'Source Code Test',
            name: 'Source-Code-Test',
            introduction: 'New intro',
            collaborators: [],
        });

        // Expect patch request to fail
        expect(responsePatch.status).toBe(401);
    });

    it('moderator can edit publication details', async () => {
        // Make 'other' user a moderator
        await User.findOneAndUpdate({ username: userDto.username }, { role: IUserRole.Moderator });

        // Send patch request
        const responsePatch = await request.patch(`/publication/test/Publication-Test`).send({
            revision: 'v2',
            title: 'Source Code Test',
            name: 'Source-Code-Test',
            introduction: 'New intro',
            collaborators: [],
        });

        //Expect patch request to succeed
        expect(responsePatch.status).toBe(200);
    });

    it('administrator can edit publication details', async () => {
        // Make 'other' user an admin
        await User.findOneAndUpdate(
            { username: userDto.username },
            { role: IUserRole.Administrator },
        );

        // Send patch request
        const responsePatch = await request.patch(`/publication/test/Publication-Test`).send({
            revision: 'v2',
            title: 'Source Code Test',
            name: 'Source-Code-Test',
            introduction: 'New intro',
            collaborators: [],
        });

        // Expect patch request to succeed
        expect(responsePatch.status).toBe(200);
    });

    it('should handle unauthorised publication delete request', async () => {
        // Send patch request
        const responsePatch = await request.delete(`/publication/test/Publication-Test`);

        // Expect patch request to fail
        expect(responsePatch.status).toBe(401);
    });

    it('moderator unable to delete publication', async () => {
        // Make 'other' user a moderator
        await User.findOneAndUpdate({ username: userDto.username }, { role: IUserRole.Moderator });

        // Send patch request
        const responsePatch = await request.delete(`/publication/test/Publication-Test`);

        // Expect patch request to succeed
        expect(responsePatch.status).toBe(401);
    });

    it('administrator can delete publication', async () => {
        // Make 'other' user a moderator
        await User.findOneAndUpdate(
            { username: userDto.username },
            { role: IUserRole.Administrator },
        );

        // Send patch request
        const responsePatch = await request.delete(`/publication/test/Publication-Test`);

        // Expect patch request to succeed
        expect(responsePatch.status).toBe(200);
    });
});
