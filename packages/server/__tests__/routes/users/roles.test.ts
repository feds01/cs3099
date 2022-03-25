import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { agent as supertest } from 'supertest';

import app from '../../../src/app';
import User, { IUserRole } from '../../../src/models/User';
import { createMockedUser } from '../../utils/factories/user';
import { registerUserAndAuthenticate } from '../../utils/requests/createUser';

const request = supertest(app);

describe('User role tests', () => {
    // Test account that will be used as the requester
    const mockedOwner = createMockedUser({ username: 'owner', email: 'owner@email.com' });
    const mockedRequester = createMockedUser({ username: 'a-user', email: 'a-user@email.com' });

    let ownerId: string;
    let requesterId: string;

    // Create a user test account before any test is run
    beforeEach(async () => {
        const ownerResponse = await registerUserAndAuthenticate(request, mockedOwner);
        const requesterResponse = await registerUserAndAuthenticate(request, mockedRequester);

        request.auth(requesterResponse.token, { type: 'bearer' });
        request.set({ 'x-refresh-token': requesterResponse.refreshToken });

        ownerId = ownerResponse.user.id;
        requesterId = requesterResponse.user.id;
    });

    /** Delete both accounts before every test */
    afterEach(async () => {
        await User.deleteMany({ _id: [requesterId, ownerId] });
    });

    it('should fail to update other users profile avatar', async () => {
        const avatarUpload = await request
            .post(`/resource/upload/${mockedOwner.username}`)
            .attach('file', '__tests__/resources/logo.png');

        expect(avatarUpload.status).toBe(401);
    });

    it('should fail to update other users profile details', async () => {
        const { email, username, name, about } = createMockedUser({ username: 'something-else' });
        const requestDto = { email, username, name, about };

        const response = await request.patch(`/user/${mockedOwner.username}`).send(requestDto);
        expect(response.status).toBe(401);
    });

    // Tests for PATCH /user/:username
    it('moderators can update other account personal info', async () => {
        // Set the requester permissions to 'Moderator' so that it can modify other accounts
        await User.findOneAndUpdate(
            { username: mockedRequester.username },
            { role: IUserRole.Moderator },
        );

        const { email, username, name, about } = createMockedUser({
            username: 'something-else',
            email: 'something@email.com',
        });
        const requestDto = { email, username, name, about };

        // call API to patch user details
        const response = await request.patch(`/user/${mockedOwner.username}`).send(requestDto);
        expect(response.status).toBe(200);

        // find user with new username
        const user = await User.findOne({ username: requestDto.username });
        expect(user).toMatchObject(requestDto);
    });

    it('administrators can update other account personal info', async () => {
        await User.findOneAndUpdate(
            { username: mockedRequester.username },
            { role: IUserRole.Administrator },
        );

        const { email, username, name, about } = createMockedUser({
            username: 'something-else',
            email: 'something@email.com',
        });
        const requestDto = { email, username, name, about };

        // call API to patch user details
        const response = await request.patch(`/user/${mockedOwner.username}`).send(requestDto);
        expect(response.status).toBe(200);

        // find user with new username
        const user = await User.findOne({ username: requestDto.username });
        expect(user).toMatchObject(requestDto);
    });

    // Tests for DELETE /user/:username
    it('user should fail to delete other users account', async () => {
        const response = await request.delete(`/user/${mockedOwner.username}`);
        expect(response.status).toBe(401);
    });

    it('moderator should fail to delete other users account', async () => {
        await User.findOneAndUpdate(
            { username: mockedRequester.username },
            { role: IUserRole.Moderator },
        );

        // Expect delete to fail
        const response = await request.delete(`/user/${mockedOwner.username}`);
        expect(response.status).toBe(401);
    });

    it('administrator can delete other users account', async () => {
        await User.findOneAndUpdate(
            { username: mockedRequester.username },
            { role: IUserRole.Administrator },
        );

        // Expect delete to be success
        const response = await request.delete(`/user/${mockedOwner.username}`);
        expect(response.status).toBe(200);
    });
});
