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

describe('Review roles tests', () => {
    // Test account
    const owner = createMockedUser({ username: 'owner' });
    let ownerResponse: AuthenticationResponse;

    // Test account that will be used as the requester
    const requester = createMockedUser({ username: 'requester' });
    let requesterResponse: AuthenticationResponse;

    // Test publication
    const mockedPublication = createMockedPublication({
        name: 'requester',
        collaborators: [],
        revision: 'v1',
    });
    let pubID = '';
    let reviewID = '';

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

        const sourceUpload = await request
            .post(`/resource/upload/publication/${pubID}`)
            .auth(ownerResponse.token, { type: 'bearer' })
            .attach('file', '__tests__/resources/sampleCode.zip');

        expect(sourceUpload.status).toBe(200);

        const createReview = await request
            .post(`/publication/${owner.username}/${mockedPublication.name}/review`)
            .auth(ownerResponse.token, { type: 'bearer' })
            .query({ revision: mockedPublication.revision });

        expect(createReview.status).toBe(201);
        expect(createReview.body.review.id).toBeDefined();
        reviewID = createReview.body.review.id;

        // Save auth header to use the 'requester' user credentials
        request.auth(requesterResponse.token, { type: 'bearer' });
        request.set({ 'x-refresh-token': requesterResponse.refreshToken });
    });

    /** Reset the requester permissions after each request and delete the created publication */
    afterEach(async () => {
        await User.findOneAndUpdate({ username: requester.username }, { role: IUserRole.Default });
        await Publication.findByIdAndDelete(pubID);
    });

    describe('Default role review abilities on unowned reviews/publications', () => {
        // Create review on other's publication
        it('should create a review on others publication', async () => {
            const createReview = await request
                .post(`/publication/${owner.username}/${mockedPublication.name}/review`)
                .query({ revision: mockedPublication.revision });

            expect(createReview.status).toBe(201);
        });

        // Fail to get someone else's draft review
        it('should get a review', async () => {
            const getReview = await request.get(`/review/${reviewID}`);

            expect(getReview.status).toBe(404);
        });

        // Fail to add comment to someone else's draft review
        it('should fail to add comment to draft review', async () => {
            const addComment = await request.put(`/review/${reviewID}/comment`).send({
                contents: "I'm a comment",
            });

            expect(addComment.status).toBe(404);
        });

        describe('Tests with completed reviews', () => {
            let commentID = '';

            /** Add two comments to the review before each start */
            beforeEach(async () => {
                const initialComment = await request
                    .put(`/review/${reviewID}/comment`)
                    .auth(ownerResponse.token, { type: 'bearer' })
                    .send({ contents: 'Comment 1' });

                const secondaryComment = await request
                    .put(`/review/${reviewID}/comment`)
                    .auth(ownerResponse.token, { type: 'bearer' })
                    .send({ contents: 'Comment 2' });

                expect(initialComment.status).toBe(201);
                expect(secondaryComment.status).toBe(201);
                commentID = initialComment.body.comment.id;

                // Complete current review
                const completeReview = await request
                    .post(`/review/${reviewID}/complete`)
                    .auth(ownerResponse.token, { type: 'bearer' });

                expect(completeReview.status).toBe(200);
            });

            // Get someone else's review
            it('should get others review', async () => {
                const getReview = await request.get(`/review/${reviewID}`);

                expect(getReview.status).toBe(200);
                expect(getReview.body.review.owner.username).toBe(owner.username);
            });

            // List all reviews on someone else's publication
            it('list reviews on others publication', async () => {
                const listReviewsID = await request.get(`/publication-by-id/${pubID}/reviews`);

                expect(listReviewsID.status).toBe(200);
                expect(listReviewsID.body.reviews).toHaveLength(1);
            });

            // List all comments on someone else's review
            it('list comments on others review', async () => {
                const commentList = await request.get(`/review/${reviewID}/comments`);

                expect(commentList.status).toBe(200);
                expect(commentList.body.comments).toHaveLength(2);
            });

            // Fail to edit someone else's comment
            it('should fail to edit others comment', async () => {
                const patchComment = await request.patch(`/comment/${commentID}`).send({
                    contents: 'Updated comment',
                });

                expect(patchComment.status).toBe(401);
            });

            // Fail to delete someone else's comment
            it('should fail to delete others comment', async () => {
                const deleteComment = await request.delete(`/comment/${commentID}`);

                expect(deleteComment.status).toBe(401);
            });
        });

        // Fail to add a comment to someone else's review
    });

    describe('Moderator role review abilities on unowned reviews/publications', () => {
        beforeEach(async () => {
            await User.findOneAndUpdate(
                { username: requester.username },
                { role: IUserRole.Moderator },
            );
        });

        describe('Tests with completed reviews', () => {
            let commentID = '';

            beforeEach(async () => {
                // Add two comments to review
                const cmntOne = await request
                    .put(`/review/${reviewID}/comment`)
                    .auth(ownerResponse.token, { type: 'bearer' })
                    .send({ contents: 'Comment 1' });
                const cmntTwo = await request
                    .put(`/review/${reviewID}/comment`)
                    .auth(ownerResponse.token, { type: 'bearer' })
                    .send({ contents: 'Comment 2' });

                expect(cmntOne.status).toBe(201);
                expect(cmntTwo.status).toBe(201);

                commentID = cmntOne.body.comment.id;

                // Complete current review
                const completeReview = await request
                    .post(`/review/${reviewID}/complete`)
                    .auth(ownerResponse.token, { type: 'bearer' });

                expect(completeReview.status).toBe(200);
            });

            // Get someone else's review
            it('should get others review', async () => {
                const getReview = await request.get(`/review/${reviewID}`);

                expect(getReview.status).toBe(200);
                expect(getReview.body.review.owner.username).toBe(owner.username);
            });

            // List all reviews on someone else's publication
            it('list reviews on others publication', async () => {
                const listReviewsID = await request.get(`/publication-by-id/${pubID}/reviews`);

                expect(listReviewsID.status).toBe(200);
                expect(listReviewsID.body.reviews).toHaveLength(1);
            });

            // List all comments on someone else's review
            it('list comments on others review', async () => {
                const commentList = await request.get(`/review/${reviewID}/comments`);

                expect(commentList.status).toBe(200);
                expect(commentList.body.comments).toHaveLength(2);
            });

            // Able to edit someone else's comment
            it('should edit others comment', async () => {
                const patchComment = await request.patch(`/comment/${commentID}`).send({
                    contents: 'Updated comment',
                });

                expect(patchComment.status).toBe(200);
            });

            // Fail to delete someone else's comment
            it('should fail to delete others comment', async () => {
                const deleteComment = await request.delete(`/comment/${commentID}`);

                expect(deleteComment.status).toBe(401);
            });
        });
    });

    describe('Administrator role review abilities on unowned reviews/publications', () => {
        beforeEach(async () => {
            await User.findOneAndUpdate(
                { username: requester.username },
                { role: IUserRole.Administrator },
            );
        });

        describe('Tests with completed reviews', () => {
            let commentID = '';

            beforeEach(async () => {
                // Add two comments to review
                const cmntOne = await request
                    .put(`/review/${reviewID}/comment`)
                    .auth(ownerResponse.token, { type: 'bearer' })
                    .send({ contents: 'Comment 1' });
                const cmntTwo = await request
                    .put(`/review/${reviewID}/comment`)
                    .auth(ownerResponse.token, { type: 'bearer' })
                    .send({ contents: 'Comment 2' });

                expect(cmntOne.status).toBe(201);
                expect(cmntTwo.status).toBe(201);

                commentID = cmntOne.body.comment.id;

                // Complete current review
                const completeReview = await request
                    .post(`/review/${reviewID}/complete`)
                    .auth(ownerResponse.token, { type: 'bearer' });

                expect(completeReview.status).toBe(200);
            });

            // Get someone else's review
            it('should get others review', async () => {
                const getReview = await request.get(`/review/${reviewID}`);

                expect(getReview.status).toBe(200);
                expect(getReview.body.review.owner.username).toBe(owner.username);
            });

            // List all reviews on someone else's publication
            it('list reviews on others publication', async () => {
                const listReviewsID = await request.get(`/publication-by-id/${pubID}/reviews`);

                expect(listReviewsID.status).toBe(200);
                expect(listReviewsID.body.reviews).toHaveLength(1);
            });

            // List all comments on someone else's review
            it('list comments on others review', async () => {
                const commentList = await request.get(`/review/${reviewID}/comments`);

                expect(commentList.status).toBe(200);
                expect(commentList.body.comments).toHaveLength(2);
            });

            // Able to edit someone else's comment
            it('should edit others comment', async () => {
                const patchComment = await request.patch(`/comment/${commentID}`).send({
                    contents: 'Updated comment',
                });

                expect(patchComment.status).toBe(200);
            });

            // Able to delete someone else's comment
            it('should delete others comment', async () => {
                const deleteComment = await request.delete(`/comment/${commentID}`);

                expect(deleteComment.status).toBe(200);
            });
        });
    });
});
