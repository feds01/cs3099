import { beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { agent as supertest } from 'supertest';

import app from '../../../src/app';
import Publication, { TransformedPublication } from '../../../src/models/Publication';
import User, { AugmentedUserDocument } from '../../../src/models/User';
import { createMockedUser } from '../../utils/factories/user';
import {
    AuthenticationResponse,
    registerUserAndAuthenticate,
} from '../../utils/requests/createUser';

const request = supertest(app);

describe('Activity endpoints testing', () => {
    let userResponse: AuthenticationResponse;
    let user: AugmentedUserDocument | null;
    let publication: TransformedPublication | null;
    
    beforeAll(async () => {
        userResponse = await registerUserAndAuthenticate(
            request,
            createMockedUser({ username: 'user' }),
        );
        user = (await User.findById(
            userResponse.user.id,
        ).exec()) as unknown as AugmentedUserDocument;
    })

    beforeEach(async () => {
        request.auth(userResponse.token, { type: 'bearer' });
    })

    it("should create activity after a publication is created and resource uploaded", async () => {
        await request.post('/publication').send({
            revision: 'v1',
            title: 'Test title',
            name: 'Test-name',
            introduction: 'Introduction here',
            collaborators: [],
        });
        publication = await Publication.findOne({ name: 'test-name', revision: 'v1' });

        // before uploading resource to the publication, the activity should not appear
        const getActivityResponseBeforeUpload = await request.get(`/user/${user!.username}/feed`);
        expect(getActivityResponseBeforeUpload.status).toBe(200);
        expect(getActivityResponseBeforeUpload.body.activities.length).toBe(0);

        await request.post(`/resource/upload/publication/${publication!.id}`).attach('file', '__tests__/resources/sampleCode.zip');
        const getActivityResponseAfterUpload = await request.get(`/user/${user!.username}/feed`);
        expect(getActivityResponseAfterUpload.status).toBe(200);
        expect(getActivityResponseAfterUpload.body.activities.length).toBe(1);
        expect(getActivityResponseAfterUpload.body.activities[0].type).toBe('publication');
        expect(getActivityResponseAfterUpload.body.activities[0].kind).toBe('create');
        expect(getActivityResponseAfterUpload.body.activities[0].owner.id).toBe(user!.id);
        expect(getActivityResponseAfterUpload.body.activities[0].references[0].document.id).toBe(publication!.id);
    });

    it("should create activity after a review is created", async () => {
        const reviewRes = await request.post(`/publication/${user!.username}/${publication!.name}/review`).query({ revision: publication!.revision });
        await request.post(`/review/${reviewRes.body.review.id}/complete`);
        const getActivityResponse = await request.get(`/user/${user!.username}/feed`);
        
        expect(getActivityResponse.status).toBe(200);
        expect(getActivityResponse.body.activities.length).toBe(2);
        expect(getActivityResponse.body.activities[0].type).toBe('review');
        expect(getActivityResponse.body.activities[0].kind).toBe('create');
        expect(getActivityResponse.body.activities[0].owner.id).toBe(user!.id);
        expect(getActivityResponse.body.activities[0].references[0].type).toBe("review");
        expect(getActivityResponse.body.activities[0].references[1].type).toBe("publication");
    });
});