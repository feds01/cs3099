import { afterEach, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { agent as supertest } from 'supertest';

import app from '../../../src/app';
import { TransformedPublication } from '../../../src/models/Publication';
import { createMockedPublication } from '../../utils/factories/publication';
import { createMockedUser } from '../../utils/factories/user';
import {
    AuthenticationResponse,
    registerUserAndAuthenticate,
} from '../../utils/requests/createUser';

const request = supertest(app);

describe('Publication tests that involve revisions', () => {
    let mockedOwner = createMockedUser({ username: 'owner' });
    let ownerResponse: AuthenticationResponse;

    // Mocked data structure represents the files that are stored in `files.zip`
    const mockedFiles = [
        {
            type: 'file',
            updatedAt: expect.any(Number),
            mimeType: 'text/plain',
            contents: 'Data\n',
            filename: 'file.txt',
        },
        {
            type: 'file',
            updatedAt: expect.any(Number),
            mimeType: 'text/plain',
            contents: 'Data2\n',
            filename: 'file2.txt',
        },
    ];

    // Test publication
    const mockedPublication = createMockedPublication({
        name: 'test',
        collaborators: [],
        revision: 'v1',
    });
    let publication: TransformedPublication;

    /** We want to create a user and then use them as an authentication source */
    beforeAll(async () => {
        ownerResponse = await registerUserAndAuthenticate(request, mockedOwner);

        request.auth(ownerResponse.token, { type: 'bearer' });
    });

    /** Create a publication before each test so that we can test various cases about it */
    beforeEach(async () => {
        // We want to create the publication on the 'owner' user
        const response = await request.post('/publication').send(mockedPublication);

        expect(response.status).toBe(201);
        expect(response.body.publication.id).toBeDefined();

        publication = response.body.publication;

        const sourceResponse = await request
            .post(`/resource/upload/publication/${publication.id}`)
            .attach('file', '__tests__/resources/files.zip');

        expect(sourceResponse.status).toBe(200);
    });

    /** Delete the publication after each test */
    afterEach(async () => {
        const response = await request.delete(
            `/publication/${mockedOwner.username}/${mockedPublication.name}`,
        );
        expect(response.status).toBe(200);
    });

    /**
     * Test to get a specific file from a publication
     */
    it('Get specific item from publication', async () => {
        // We want to get a specific file from the publication using the specified path
        const response = await request.get(
            `/publication/${mockedOwner.username}/${mockedPublication.name}/tree/file.txt`,
        );

        console.log(response.body.entry);
        expect(response.status).toBe(200);
        expect(response.body.entry).toStrictEqual(mockedFiles[0]);
    });

    /**
     * Attempt to fetch a file that doesn't exist
     */
    it('Get specific item from publication', async () => {
        // We want to get a specific file from the publication using the specified path
        const response = await request.get(
            `/publication/${mockedOwner.username}/${mockedPublication.name}/tree/file3.txt`,
        );
        expect(response.status).toBe(404);
    });

    /**
     * Test getting all the files from a publication
     */
    it('Get all files from a publication', async () => {
        const response = await request.get(
            `/publication/${mockedOwner.username}/${mockedPublication.name}/sources`,
        );

        expect(response.status).toBe(200);
        expect(response.body.entries).toStrictEqual(mockedFiles);
    });
});
