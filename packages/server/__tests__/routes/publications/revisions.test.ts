import { afterEach, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { agent as supertest } from 'supertest';

import * as errors from '../../../src/common/errors';
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
    });

    /** Delete the publication after each test */
    afterEach(async () => {
        const response = await request.delete(
            `/publication/${mockedOwner.username}/${mockedPublication.name}/all`,
        );
        expect(response.status).toBe(200);
    });

    /**
     * Revise a publication with a valid revision tag should succeed
     */
    it('should allow to revise a publication', async () => {
        // Upload sources to the original publication
        await request
            .post(`/resource/upload/publication/${publication.id}`)
            .attach('file', '__tests__/resources/sampleCode.zip');

        const requestDto = {
            revision: 'v2',
            changelog: 'Revised publication',
        };

        const response = await request
            .post(`/publication/${mockedOwner.username}/${mockedPublication.name}/revise`)
            .send(requestDto);

        expect(response.status).toBe(200);

        // Upload sources to the new publication
        const sourceUpload = await request
            .post(`/resource/upload/publication/${response.body.publication.id}`)
            .attach('file', '__tests__/resources/sampleCode.zip');

        expect(sourceUpload.status).toBe(200);
    });

    /**
     * Revise a publication with an invalid revision tag should fail. Invalid
     * revision tags are those that contain any non URL-safe characters
     */
    it('should fail to revise a publication with invalid revision tag', async () => {
        // Upload sources to the original publication
        await request
            .post(`/resource/upload/publication/${publication.id}`)
            .attach('file', '__tests__/resources/sampleCode.zip');

        const requestDto = {
            revision: '√2',
            changelog: 'Revised publication',
        };

        const response = await request
            .post(`/publication/${mockedOwner.username}/${mockedPublication.name}/revise`)
            .send(requestDto);

        // Verify that the revision process failed due to unsafe tag specified
        expect(response.status).toBe(400);
        expect(response.body.errors).toStrictEqual({
            revision: { message: 'Revision must be URL safe.' },
        });
    });

    /**
     * Attempt to revise a publication that has no sources as it's marked draft. Draft publications
     * cannot be revised until they have sources.
     */
    it('drafted publications cannot be revised', async () => {
        const requestDto = {
            revision: 'v2',
            changelog: 'Revised publication',
        };

        const response = await request
            .post(`/publication/${mockedOwner.username}/${mockedPublication.name}/revise`)
            .send(requestDto);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe(errors.NON_LIVE_PUBLICATION);
    });

    /**
     * List revisions on a specific publication
     */
    it('List revisions of a publication after revising', async () => {
        // Upload sources to the original publication
        await request
            .post(`/resource/upload/publication/${publication.id}`)
            .attach('file', '__tests__/resources/sampleCode.zip');

        const requestDto = {
            revision: 'v2',
            changelog: 'Revised publication',
        };

        const revisionResponse = await request
            .post(`/publication/${mockedOwner.username}/${mockedPublication.name}/revise`)
            .send(requestDto);
        expect(revisionResponse.status).toBe(200);

        // Listing the revisions should return two almost identical revisions with the
        // second one having a new revision field and a different id
        const revisionsResponse = await request.get(
            `/publication/${mockedOwner.username}/${mockedPublication.name}/revisions`,
        );
        expect(revisionResponse.status).toBe(200);
        expect(revisionsResponse.body.revisions).toHaveLength(2);

        // @@Hack: we need to omit the attachment data because it might not be returned by the endpoint
        const { attachment: _, ...revisedPublication } = revisionResponse.body.publication;

        expect(revisionsResponse.body.revisions).toStrictEqual([
            revisedPublication,
            {
                ...publication,
                current: false,
                draft: false,
                updatedAt: revisionsResponse.body.revisions[1].updatedAt,
            },
        ]);
    });

    /**
     * List revisions on a specific publication without being an owner or a collaborator
     * should not show the revised publication because it's still in draft mode.
     */
    it('List revisions of a publication after revising', async () => {
        // Make a new 'requester' user that is not associated with the publication
        const requester = await registerUserAndAuthenticate(
            request,
            createMockedUser({ username: 'requester' }),
        );

        // Upload sources to the original publication from the perspective of the 'owner'
        await request
            .post(`/resource/upload/publication/${publication.id}`)
            .attach('file', '__tests__/resources/sampleCode.zip');

        const requestDto = {
            revision: 'v2',
            changelog: 'Revised publication',
        };

        const revisionResponse = await request
            .post(`/publication/${mockedOwner.username}/${mockedPublication.name}/revise`)
            .send(requestDto);
        expect(revisionResponse.status).toBe(200);

        // Listing the revisions should return two almost identical revisions with the
        // second one having a new revision field and a different id...
        const revisionsResponse = await request
            .get(`/publication/${mockedOwner.username}/${mockedPublication.name}/revisions`)
            .auth(requester.token, { type: 'bearer' });

        expect(revisionResponse.status).toBe(200);
        expect(revisionsResponse.body.revisions).toHaveLength(1);
        expect(revisionsResponse.body.revisions).toStrictEqual([
            {
                ...publication,
                current: false,
                draft: false,
                updatedAt: revisionsResponse.body.revisions[0].updatedAt,
            },
        ]);
    });
});
