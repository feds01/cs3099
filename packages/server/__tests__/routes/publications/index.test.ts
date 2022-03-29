import { beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { agent as supertest } from 'supertest';

import app from '../../../src/app';
import Publication from '../../../src/models/Publication';
import User, { AugmentedUserDocument } from '../../../src/models/User';
import { createMockedUser } from '../../utils/factories/user';
import {
    AuthenticationResponse,
    registerUserAndAuthenticate,
} from '../../utils/requests/createUser';

const request = supertest(app);

describe('Publications endpoints testing', () => {
    let ownerResponse: AuthenticationResponse;
    let collaboratorResponse1: AuthenticationResponse;
    let collaboratorResponse2: AuthenticationResponse;

    let owner: AugmentedUserDocument | null;
    let collaborator1: AugmentedUserDocument | null;
    let collaborator2: AugmentedUserDocument | null;

    beforeAll(async () => {
        ownerResponse = await registerUserAndAuthenticate(
            request,
            createMockedUser({ username: 'owner' }),
        );
        collaboratorResponse1 = await registerUserAndAuthenticate(
            request,
            createMockedUser({ username: 'collaborator_1' }),
        );
        collaboratorResponse2 = await registerUserAndAuthenticate(
            request,
            createMockedUser({ username: 'collaborator_2' }),
        );

        owner = (await User.findById(
            ownerResponse.user.id,
        ).exec()) as unknown as AugmentedUserDocument;
        collaborator1 = (await User.findById(
            collaboratorResponse1.user.id,
        ).exec()) as unknown as AugmentedUserDocument;
        collaborator2 = (await User.findById(
            collaboratorResponse2.user.id,
        ).exec()) as unknown as AugmentedUserDocument;
    });

    /** Set the auth headers before all the tests */
    beforeEach(async () => {
        request.auth(ownerResponse.token, { type: 'bearer' });
    });

    // Tests for POST /publication/
    it('should create a publication', async () => {
        const response = await request.post('/publication').send({
            revision: 'v1',
            title: 'Test title',
            name: 'Test-name',
            introduction: 'Introduction here',
            collaborators: [collaborator1!.username, collaborator2!.username],
        });

        expect(response.status).toBe(201);
        expect(response.body.publication.title).toBe('Test title');
        expect(response.body.publication.name).toBe('test-name');
        expect(response.body.publication.introduction).toBe('Introduction here');

        // Verify that the the users have been projected...
        expect(response.body.publication.collaborators).toEqual([
            User.project(collaborator1!),
            User.project(collaborator2!),
        ]);

        // Verify that the owner has been projected...
        expect(response.body.publication.owner).toStrictEqual(User.project(owner!));

        // Verify that it exists in the database
        const publication = await Publication.findOne({
            username: 'owner',
            name: 'test-name',
            revision: 'v1',
        });
        expect(publication).not.toBeNull();
    });

    it('should return bad request when using an invalid name', async () => {
        const badUsername = encodeURIComponent('ålπha^');
        const badPublicationName = encodeURIComponent('µniverse^');

        const usernameResponse = await request.get(`/publication/${badUsername}`);
        expect(usernameResponse.status).toBe(400);
        expect(usernameResponse.body.errors).toStrictEqual({
            username: { message: 'Username must be URL safe' },
        });

        const nameResponse = await request.get(`/publication/${badUsername}/${badPublicationName}`);
        expect(nameResponse.status).toBe(400);

        expect(nameResponse.body.errors).toStrictEqual({
            username: { message: 'Username must be URL safe' },
            name: { message: 'Name must be URL safe.' },
        });
    });

    it('should return a bad request when creating a publication with the same name and different revision', async () => {
        const response = await request.post('/publication').send({
            revision: 'v2',
            title: 'Test title',
            name: 'Test-name',
            introduction: 'Introduction here',
            collaborators: [collaborator1!.username, collaborator2!.username],
        });

        expect(response.status).toBe(400);
    });

    it('should not create a publication with a redundant name and revision', async () => {
        const response = await request.post('/publication/').send({
            revision: 'v1',
            title: 'Test title',
            name: 'Test-name',
            introduction: 'Introduction here',
            collaborators: [collaborator1!.username, collaborator2!.username],
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Publication with the same name already exists');

        const publicationNum = await Publication.count({ name: 'test-name', revision: 'v1' });
        expect(publicationNum).toBe(1);
    });

    it('should not create a publication with a non-existent collaborator', async () => {
        const response = await request.post('/publication').send({
            revision: 'v1',
            title: 'Test title',
            name: 'Test-name-2',
            introduction: 'Introduction here',
            collaborators: [collaborator1!.username, 'collabo3'],
        });

        expect(response.status).toBe(400);
        expect(response.body.errors).toStrictEqual({
            'collaborators.1': { message: 'No user with the given username or id exists' },
        });
    });

    // Tests for GET /publication/:username/
    it('should get all publications of a user', async () => {
        // Make a request to get all of the publications of the user 'owner'
        const response = await request.get(`/publication/${owner!.username}`);

        expect(response.status).toBe(200);
        expect(response.body.publications).toHaveLength(1);
    });

    // Tests for DELETE /publication/:username/:name
    it('should delete publication', async () => {
        // Make a request to get all of the publications of the user 'owner'
        const response = await request.delete(`/publication/${owner!.username}/Test-name`);

        expect(response.status).toBe(200);
    });
});
