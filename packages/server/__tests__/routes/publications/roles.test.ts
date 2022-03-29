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
    const mockedPublication = createMockedPublication({
        name: 'test',
        collaborators: [],
        revision: 'v1',
    });
    let publicationId = '';

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

        publicationId = response.body.publication.id;

        // Save auth header to use the 'requester' user credentials
        request.auth(requesterResponse.token, { type: 'bearer' });
        request.set({ 'x-refresh-token': requesterResponse.refreshToken });
    });

    /** Reset the requester permissions after each request and delete the created publication */
    afterEach(async () => {
        await User.findOneAndUpdate({ username: requester.username }, { role: IUserRole.Default });

        await Publication.findByIdAndDelete(publicationId);
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

    it('owner patching publication details should be possible', async () => {
        const { title, introduction, about, pinned } = createMockedPublication({
            introduction: 'Improved introduction',
        });
        const requestDto = { title, introduction, about, pinned };

        // so we attempt to modify the 'draft' status on the publications
        const response = await request
            .patch(`/publication/${owner.username}/${mockedPublication.name}`)
            .auth(ownerResponse.token, { type: 'bearer' })
            .send(requestDto);

        expect(response.status).toBe(200);

        // Now let's find the publication and verify that we can update the publication
        const publication = await Publication.findById(response.body.publication.id).exec();

        // verify that the details were updated
        expect({
            title: publication?.title,
            introduction: publication?.introduction,
            about: publication?.about,
            pinned: publication?.pinned,
        }).toStrictEqual(requestDto);
    });

    /** Test that modifying the 'draft' status is not allowed on a publication */
    it('owner patching a publication `draft` status should not be possible', async () => {
        // so we attempt to modify the 'draft' status on the publications
        const response = await request
            .patch(`/publication/${owner.username}/${mockedPublication.name}`)
            .auth(ownerResponse.token, { type: 'bearer' })
            .send({
                draft: false,
            });

        // The service should reply with a '200' because it omits keys that it does
        // not recognise from the patch request. Since 'draft' is marked as being
        // a key that cannot be modified, the server will remove the field from the
        // object entirely...
        expect(response.status).toBe(200);

        // Now verify that the actual publication document is still marked as draft.
        const publication = await Publication.findById(publicationId).exec();
        expect(publication?.draft).toBe(true);
    });

    it('moderator can edit publication details', async () => {
        // Make 'other' user a moderator
        await User.findOneAndUpdate(
            { username: requester.username },
            { role: IUserRole.Moderator },
        );

        const { title, introduction, about, pinned } = createMockedPublication({
            introduction: 'Improved introduction',
        });
        const requestDto = { title, introduction, about, pinned };

        // Send patch request
        const response = await request
            .patch(`/publication/${owner.username}/${mockedPublication.name}`)
            .send(requestDto);

        //Expect patch request to succeed
        expect(response.status).toBe(200);

        // Now let's find the publication and verify that we can update the publication
        const publication = await Publication.findById(response.body.publication.id).exec();

        // verify that the details were updated
        expect({
            title: publication?.title,
            introduction: publication?.introduction,
            about: publication?.about,
            pinned: publication?.pinned,
        }).toStrictEqual(requestDto);
    });

    it('administrator can edit publication details', async () => {
        // Make 'other' user an admin
        await User.findOneAndUpdate(
            { username: requester.username },
            { role: IUserRole.Administrator },
        );

        const { title, introduction, about, pinned } = createMockedPublication({
            introduction: 'Improved introduction',
        });
        const requestDto = { title, introduction, about, pinned };

        // Send patch request
        const response = await request
            .patch(`/publication/${owner.username}/${mockedPublication.name}`)
            .send(requestDto);

        // Expect patch request to succeed
        expect(response.status).toBe(200);

        // Now let's find the publication and verify that we can update the publication
        const publication = await Publication.findById(response.body.publication.id).exec();

        // verify that the details were updated
        expect({
            title: publication?.title,
            introduction: publication?.introduction,
            about: publication?.about,
            pinned: publication?.pinned,
        }).toStrictEqual(requestDto);
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
