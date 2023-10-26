import { afterEach, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { agent as supertest } from 'supertest';

import app from '../../../src/app';
import Activity from '../../../src/models/Activity';
import Publication, { TransformedPublication } from '../../../src/models/Publication';
import { TransformedReview } from '../../../src/models/Review';
import { createMockedPublication } from '../../utils/factories/publication';
import { createMockedUser } from '../../utils/factories/user';
import {
    AuthenticationResponse,
    registerUserAndAuthenticate,
} from '../../utils/requests/createUser';

const request = supertest(app);

describe('Activity endpoints testing', () => {
    let userResponse: AuthenticationResponse;
    let publicationResponse: TransformedPublication;

    const mockedPublication = createMockedPublication({
        revision: 'v1',
        name: 'test',
        collaborators: [],
    });

    beforeAll(async () => {
        userResponse = await registerUserAndAuthenticate(
            request,
            createMockedUser({ username: 'user' }),
        );

        request.auth(userResponse.token, { type: 'bearer' });
    });

    /** Create the publication before each request */
    beforeEach(async () => {
        const response = await request.post('/publication').send(mockedPublication);
        expect(response.status).toBe(201);

        // extract the publication
        publicationResponse = response.body.publication;
    });

    /** Delete the publication after each test */
    afterEach(async () => {
        await Publication.findByIdAndDelete(publicationResponse.id).exec();

        // Clear all activities for the user after each test
        await Activity.deleteMany({}).exec();
    });

    it('should create activity after a publication is created and resource uploaded', async () => {
        const { user } = userResponse;

        // before uploading resource to the publication, the activity should not appear
        const getActivityResponseBeforeUpload = await request.get(`/user/${user.username}/feed`);
        expect(getActivityResponseBeforeUpload.status).toBe(200);
        expect(getActivityResponseBeforeUpload.body.activities.length).toBe(0);

        // Upload the source file to publication, marking it as non-drafted and the
        // activity as live
        await request
            .post(`/resource/upload/publication/${publicationResponse.id}`)
            .attach('file', '__tests__/resources/sampleCode.zip');

        // Verify that the activity now appears to be in the 'feed'
        const activityFeedResponse = await request.get(`/user/${user!.username}/feed`);
        expect(activityFeedResponse.status).toBe(200);

        expect(activityFeedResponse.body.activities.length).toBe(1);
        expect(activityFeedResponse.body.activities[0]).toEqual(
            expect.objectContaining({
                type: 'publication',
                kind: 'create',
                owner: expect.objectContaining({
                    id: user.id,
                }),
                references: expect.arrayContaining([
                    expect.objectContaining({ type: 'publication' }),
                ]),
            }),
        );
    });

    it('should create activity after a review is created', async () => {
        const { user } = userResponse;

        // Upload the source file to publication, marking it as non-drafted
        await request
            .post(`/resource/upload/publication/${publicationResponse.id}`)
            .attach('file', '__tests__/resources/sampleCode.zip');

        const reviewRes = await request.post(`/publication-by-id/${publicationResponse.id}/review`);
        expect(reviewRes.status).toBe(201);

        const { review }: { review: TransformedReview } = reviewRes.body;

        await request.post(`/review/${review.id}/complete`);

        const activityFeedResponse = await request.get(`/user/${user.username}/feed`);
        expect(activityFeedResponse.status).toBe(200);

        // Verify that the activity feed now has two activities, but the most
        // recent will be the completion of the review
        expect(activityFeedResponse.body.activities.length).toBe(2);
        expect(activityFeedResponse.body.activities[0]).toEqual(
            expect.objectContaining({
                type: 'review',
                kind: 'create',
                owner: expect.objectContaining({
                    id: user.id,
                }),
                references: expect.arrayContaining([
                    expect.objectContaining({ type: 'review' }),
                    expect.objectContaining({ type: 'publication' }),
                ]),
            }),
        );
    });
});
