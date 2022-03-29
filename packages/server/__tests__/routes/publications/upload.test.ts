import { afterEach, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { agent as supertest } from 'supertest';

import app from '../../../src/app';
import { CODES } from '../../../src/common/errors';
import { createMockedPublication } from '../../utils/factories/publication';
import { createMockedUser } from '../../utils/factories/user';
import { registerUserAndAuthenticate } from '../../utils/requests/createUser';

const request = supertest(app);

describe('Uploading source code tests', () => {
    const mockedOwner = createMockedUser({ username: 'owner' });

    const mockedPublication = createMockedPublication({
        name: 'test',
        collaborators: [],
        revision: 'v1',
    });
    let pubID = '';

    /** Setup all the test by creating the publication owner */
    beforeAll(async () => {
        const ownerResponse = await registerUserAndAuthenticate(request, mockedOwner);

        request.auth(ownerResponse.token, { type: 'bearer' });
        request.set({ 'x-refresh-token': ownerResponse.refreshToken });
    });

    /** Create a publication before each test */
    beforeEach(async () => {
        const response = await request.post('/publication').send(mockedPublication);

        expect(response.status).toBe(201);
        expect(response.body.publication.id).toBeDefined();

        pubID = response.body.publication.id;
    });

    /** Delete the publication after each test to clean up all resources */
    afterEach(async () => {
        await request.delete(`/publication/${mockedOwner.username}/${mockedPublication.name}`);
    });

    it('should upload source code to publication', async () => {
        const sourceUpload = await request
            .post(`/resource/upload/publication/${pubID}`)
            .attach('file', '__tests__/resources/sampleCode.zip');

        expect(sourceUpload.status).toBe(200);
    });

    it('should fail to upload source code to publication when source already there', async () => {
        const sourceUpload = await request
            .post(`/resource/upload/publication/${pubID}`)
            .attach('file', '__tests__/resources/sampleCode.zip');

        expect(sourceUpload.status).toBe(200);

        // Now attempt to re-send a file to check that file submission is immutable once uploaded
        const reUpload = await request
            .post(`/resource/upload/publication/${pubID}`)
            .attach('file', '__tests__/resources/sampleCode.zip');

        expect(reUpload.status).toBe(400);

        // Verify that the publication source upload failed because it already had
        // a resource attached to it
        expect(reUpload.body.errors).toHaveProperty('file');
        expect(reUpload.body.errors.file.code).toBe(CODES.PUBLICATION_ARCHIVE_EXISTS);
    });
});
