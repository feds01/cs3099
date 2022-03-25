import { afterEach, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { agent as supertest } from 'supertest';

import app from '../../../src/app';
import Publication from '../../../src/models/Publication';
import User, { IUserRole } from '../../../src/models/User';
import { createMockedPublication } from '../../utils/factories/publication';
import { createMockedUser } from '../../utils/factories/user';
import {
    AuthenticationResponse,
    registerUserAndAuthenticate,
} from '../../utils/requests/createUser';

const request = supertest(app);

describe('Publication role tests', () => {
    // Test account
    const owner = createMockedUser({ username: 'test' });
    let ownerResponse: AuthenticationResponse;

    // Test account that will be used as the requester
    const requester = createMockedUser({ username: 'a-user' });
    let requesterResponse: AuthenticationResponse;

    // Test publication
    const mockedPublication = createMockedPublication({ name: 'test', collaborators: [] });
    let pubID = '';

    // Create a user test account before any test is run
    beforeAll(async () => {
        ownerResponse = await registerUserAndAuthenticate(request, owner);
        requesterResponse = await registerUserAndAuthenticate(request, requester);
    });

    /** Create the publication before each test */
    beforeEach(async () => {
        // We want to create the publication on the 'owner' user
        const response = await request
            .post('/publication')
            .auth(ownerResponse.token, { type: 'bearer' })
            .send(mockedPublication);

        expect(response.status).toBe(201);
        expect(response.body.publication.id).toBeDefined();

        pubID = response.body.publication.id;

        // Save auth header to use the 'requester' user credentials
        request.auth(requesterResponse.token, { type: 'bearer' });
        request.set({ 'x-refresh-token': requesterResponse.refreshToken });
    });

    /** Reset the requester permissions after each request and delete the created publication */
    afterEach(async () => {
        await User.findOneAndUpdate({ username: requester.username }, { role: IUserRole.Default });

        await Publication.findByIdAndDelete(pubID);
    });

    it('should handle unauthorised publication edit request', async () => {
        // Send patch request
        const responsePatch = await request
            .patch(`/publication/${owner.username}/${mockedPublication.name}`)
            .send({
                revision: 'v2',
                title: 'Source Code Test',
                introduction: 'New intro',
                collaborators: [],
            });

        // Expect patch request to fail
        expect(responsePatch.status).toBe(401);
    });

    it('moderator can edit publication details', async () => {
        // Make 'other' user a moderator
        await User.findOneAndUpdate(
            { username: requester.username },
            { role: IUserRole.Moderator },
        );

        // Send patch request
        const responsePatch = await request
            .patch(`/publication/${owner.username}/${mockedPublication.name}`)
            .send({
                revision: 'v2',
                title: 'Source Code Test',
                introduction: 'New intro',
                collaborators: [],
            });

        //Expect patch request to succeed
        expect(responsePatch.status).toBe(200);
    });

    it('administrator can edit publication details', async () => {
        // Make 'other' user an admin
        await User.findOneAndUpdate(
            { username: requester.username },
            { role: IUserRole.Administrator },
        );

        // Send patch request
        const responsePatch = await request
            .patch(`/publication/${owner.username}/${mockedPublication.name}`)
            .send({
                revision: 'v2',
                title: 'Source Code Test',
                introduction: 'New intro',
                collaborators: [],
            });

        // Expect patch request to succeed
        expect(responsePatch.status).toBe(200);
    });

    it('should handle unauthorised publication delete request', async () => {
        // Send patch request
        const responsePatch = await request.delete(
            `/publication/${owner.username}/${mockedPublication.name}`,
        );

        // Expect patch request to fail
        expect(responsePatch.status).toBe(401);
    });

    it('moderator unable to delete publication', async () => {
        // Make 'other' user a moderator
        await User.findOneAndUpdate(
            { username: requester.username },
            { role: IUserRole.Moderator },
        );

        // Send patch request
        const responsePatch = await request.delete(
            `/publication/${owner.username}/${mockedPublication.name}`,
        );

        // Expect patch request to succeed
        expect(responsePatch.status).toBe(401);
    });

    it('administrator can delete publication', async () => {
        // Make 'other' user a moderator
        await User.findOneAndUpdate(
            { username: requester.username },
            { role: IUserRole.Administrator },
        );

        // Send patch request
        const responsePatch = await request.delete(
            `/publication/${owner.username}/${mockedPublication.name}`,
        );

        // Expect patch request to succeed
        expect(responsePatch.status).toBe(200);
    });
});
