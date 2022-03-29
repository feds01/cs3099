import { afterEach, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { agent as supertest } from 'supertest';

import app from '../../../src/app';
import Comment from '../../../src/models/Comment';
import { createMockedPublication } from '../../utils/factories/publication';
import { createMockedUser } from '../../utils/factories/user';
import { registerUserAndAuthenticate } from '../../utils/requests/createUser';

const request = supertest(app);

describe('Review tests', () => {
    const mockedOwner = createMockedUser({ username: 'owner' });

    const mockedPublication = createMockedPublication({
        name: 'test',
        revision: 'v1.0',
        collaborators: [],
    });

    let pubID = '';
    let reviewId = '';

    /** Setup all the test by creating the publication owner */
    beforeAll(async () => {
        const ownerResponse = await registerUserAndAuthenticate(request, mockedOwner);

        request.auth(ownerResponse.token, { type: 'bearer' });
        request.set({ 'x-refresh-token': ownerResponse.refreshToken });
    });

    describe('Testing reviews on publications with source', () => {
        /** Create a publication before each test */
        beforeEach(async () => {
            const response = await request.post('/publication').send(mockedPublication);

            expect(response.status).toBe(201);
            expect(response.body.publication.id).toBeDefined();
            pubID = response.body.publication.id;

            const sourceUpload = await request
                .post(`/resource/upload/publication/${pubID}`)
                .attach('file', '__tests__/resources/sampleCode.zip');

            expect(sourceUpload.status).toBe(200);

            // TEST that a review can be created on publication with source
            const createReview = await request
                .post(`/publication/${mockedOwner.username}/${mockedPublication.name}/review`)
                .query({ revision: mockedPublication.revision });

            expect(createReview.status).toBe(201);
            expect(createReview.body.review.id).toBeDefined();
            reviewId = createReview.body.review.id;
        });

        /** Delete the publication after each test to clean up all resources */
        afterEach(async () => {
            const pubDelete = await request.delete(`/publication/owner/${mockedPublication.name}`);

            expect(pubDelete.status).toBe(200);
        });

        it('should get a review', async () => {
            const getReview = await request.get(`/review/${reviewId}`);

            expect(getReview.status).toBe(200);
        });

        it('should add a comment to review', async () => {
            const addComment = await request.put(`/review/${reviewId}/comment`).send({
                contents: "I'm a comment",
            });

            expect(addComment.status).toBe(201);
        });

        describe('Comment tests', () => {
            let commentID = '';

            beforeEach(async () => {
                const addComment = await request.put(`/review/${reviewId}/comment`).send({
                    contents: 'Test comment',
                });

                expect(addComment.status).toBe(201);
                commentID = addComment.body.comment.id;
            });

            afterEach(async () => {
                const deleteComment = await request.delete(`/comment/${commentID}`);

                expect(deleteComment.status).toBe(200);
            });

            // Get comment
            it('should get a comment', async () => {
                const getComment = await request.get(`/comment/${commentID}`);

                expect(getComment.status).toBe(200);
                expect(getComment.body.comment.contents).toBe('Test comment');
            });

            // Patch comment
            it('should patch comment contents', async () => {
                const patchComment = await request.patch(`/comment/${commentID}`).send({
                    contents: 'Updated comment',
                });

                expect(patchComment.status).toBe(200);
                expect(patchComment.body.comment.contents).toBe('Updated comment');
            });
        });

        //  Comment on file and line
        it('should add a comment to review with an associated file & line', async () => {
            const requestDto = {
                contents: "I'm a comment",
                filename: 'sampleCode/sample2.html',
                anchor: {
                    start: 1,
                    end: 2,
                },
            };

            const addComment = await request.put(`/review/${reviewId}/comment`).send(requestDto);
            expect(addComment.status).toBe(201);

            // Verify that the comment has the right details
            const comment = await Comment.findById(addComment.body.comment.id).exec();
            const { contents, filename, anchor } = comment?.toObject()!;

            expect({ contents, filename, anchor }).toStrictEqual(requestDto);
        });

        //  Comment for file with no line anchor
        it('should add comment a to review with no anchor', async () => {
            const addComment = await request.put(`/review/${reviewId}/comment`).send({
                contents: "I'm a comment",
                filename: 'sampleCode/sample2.html',
            });

            expect(addComment.status).toBe(201);
        });

        // Adding comment to invalid source
        it('should fail to add comment on review with invalid source', async () => {
            const addComment = await request.put(`/review/${reviewId}/comment`).send({
                contents: "I'm a comment",
                filename: 'src/test.ts',
            });

            expect(addComment.status).toBe(400);
        });

        // Adding comment with invalid line numbers
        it('should fail to add comment on review with invalid anchor', async () => {
            const addComment = await request.put(`/review/${reviewId}/comment`).send({
                contents: "I'm a comment",
                filename: 'src/test.ts',
                anchor: {
                    start: 100,
                    end: 104,
                },
            });

            expect(addComment.status).toBe(400);
        });

        // List all reviews on a publication
        // @TODO add test for when 0 reviews
        it('should list all reviews on a publication', async () => {
            const listReviewsQuery = await request
                .get(`/publication/${mockedOwner.username}/${mockedPublication.name}/reviews`)
                .query({ revision: mockedPublication.revision });

            expect(listReviewsQuery.status).toBe(200);
            expect(listReviewsQuery.body.reviews).toHaveLength(1);

            const listReviewsID = await request.get(`/publication-by-id/${pubID}/reviews`);

            expect(listReviewsID.status).toBe(200);
            expect(listReviewsID.body.reviews).toHaveLength(1);
        });

        // List all comments on a review
        it('should list all comments on a review', async () => {
            const firstCommentList = await request.get(`/review/${reviewId}/comments`);

            expect(firstCommentList.status).toBe(200);
            expect(firstCommentList.body.comments).toHaveLength(0);

            await request.put(`/review/${reviewId}/comment`).send({ contents: 'Comment 1' });
            await request.put(`/review/${reviewId}/comment`).send({ contents: 'Comment 2' });

            const secondCommentList = await request.get(`/review/${reviewId}/comments`);

            expect(secondCommentList.status).toBe(200);
            expect(secondCommentList.body.comments).toHaveLength(2);
        });

        //

        // TEST that deleting review deletes comment
    });

    describe('Testing reviews on publications with no source', () => {
        it('should fail to review draft publication', async () => {
            const draftMockedPublication = createMockedPublication({
                name: 'draft',
                revision: 'v0.0',
                collaborators: [],
            });
            const response = await request.post('/publication').send(draftMockedPublication);
            expect(response.status).toBe(201);

            const createReview = await request
                .post(`/publication/${mockedOwner.username}/${draftMockedPublication.name}/review`)
                .query({ revision: draftMockedPublication.revision });

            expect(createReview.status).toBe(404);
            expect(createReview.body.message).toBe('Resource could not be found.');
        });
    });

    describe('Testing cascading deletion', () => {
        beforeEach(async () => {
            // Create publication
            const response = await request.post('/publication').send(mockedPublication);

            expect(response.status).toBe(201);
            expect(response.body.publication.id).toBeDefined();

            pubID = response.body.publication.id;

            // Upload source
            const sourceUpload = await request
                .post(`/resource/upload/publication/${pubID}`)
                .attach('file', '__tests__/resources/sampleCode.zip');

            expect(sourceUpload.status).toBe(200);

            // Create review
            const createReview = await request
                .post(`/publication/${mockedOwner.username}/${mockedPublication.name}/review`)
                .query({ revision: mockedPublication.revision });

            expect(createReview.status).toBe(201);
            expect(createReview.body.review.id).toBeDefined();
            reviewId = createReview.body.review.id;
        });

        describe('Delete undeleted publication', () => {
            afterEach(async () => {
                const pubDelete = await request.delete(
                    `/publication/owner/${mockedPublication.name}`,
                );
                expect(pubDelete.status).toBe(200);
            });

            it('should delete comments when review is deleted', async () => {
                const addComment = await request.put(`/review/${reviewId}/comment`).send({
                    contents: "I'm a comment",
                });

                expect(addComment.status).toBe(201);
                const commentID = addComment.body.comment.id;

                // Delete review
                const revDelete = await request.delete(`/review/${reviewId}`);
                expect(revDelete.status).toBe(200);

                // Attempt to get comment
                const getComment = await request.get(`/comment/${commentID}`);

                expect(getComment.status).toBe(404);
            });
        });

        it('should delete reviews when publication is deleted', async () => {
            // Delete publication
            const pubDelete = await request.delete(
                `/publication/${mockedOwner.username}/${mockedPublication.name}`,
            );
            expect(pubDelete.status).toBe(200);

            // Attempt to get review
            const getReview = await request.get(`/review/${reviewId}`);

            expect(getReview.status).toBe(404);
        });

        // it('should delete comments when publication is deleted', async () => {
        it('cascade-delete-comment', async () => {
            const addComment = await request.put(`/review/${reviewId}/comment`).send({
                contents: "I'm a comment",
            });

            expect(addComment.status).toBe(201);
            const commentId = addComment.body.comment.id;

            // Delete publication
            const pubDelete = await request.delete(
                `/publication/${mockedOwner.username}/${mockedPublication.name}`,
            );
            expect(pubDelete.status).toBe(200);

            // Attempt to get comment
            const getComment = await request.get(`/comment/${commentId}`);

            expect(getComment.status).toBe(404);
        });
    });
});
