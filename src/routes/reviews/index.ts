import express from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';

import * as errors from '../../common/errors';
import * as file from '../../lib/resources/file';
import * as zip from '../../lib/resources/zip';
import Logger from '../../common/logger';
import { verifyReviewPermission } from '../../lib/communication/permissions';
import registerRoute from '../../lib/communication/requests';
import Comment from '../../models/Comment';
import { IPublication, IPublicationDocument } from '../../models/Publication';
import Review, { IReviewStatus, PopulatedReview } from '../../models/Review';
import { IUser, IUserDocument, IUserRole } from '../../models/User';
import { ResponseErrorSummary } from '../../transformers/error';
import { ICommentCreationSchema } from '../../validators/comments';
import { ObjectIdSchema } from '../../validators/requests';

const router = express.Router();

/**
 * @version v1.0.0
 * @method PUT
 * @url /api/review/:id/comment
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/review/89183192381293/comment
 *
 * @description This endpoint is used to add a comment to a given review specified
 * by it's id. The endpoint accepts a comment object that contains information about
 * it's relation to the publication sources, the content of the comment and whether
 * it is a replying comment rather than a standalone comment.
 *
 */
registerRoute(router, '/:id/comment', {
    method: 'put',
    body: ICommentCreationSchema,
    query: z.object({}),
    params: z.object({ id: ObjectIdSchema }),
    permissionVerification: verifyReviewPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const { replying, filename, anchor, contents } = req.body;

        const review = await Review.findById(req.params.id)
            .populate<{ owner: IUserDocument }>('owner')
            .populate<{ publication: IPublicationDocument }>('publication')
            .exec();

        // Check that the review exists and that the current commenter isn't trying
        // to publish comments on a non-public review. Only a review owner can comment
        // on a review whilst creating it.
        if (!review || (review.status === 'started' && review.owner.id !== req.requester.id)) {
            return {
                status: 'error',
                code: 404,
                message: errors.RESOURCE_NOT_FOUND,
            };
        }

        // check that the publication isn't in draft mode...
        if (review.publication.draft) {
            return {
                status: 'error',
                code: 400,
                message: 'Cannot comment on a drafted publication.',
            };
        }

        // Check if the thread is replying to another comment
        let thread = new mongoose.Types.ObjectId();

        if (typeof replying !== 'undefined') {
            const replyingComment = await Comment.findById(replying).exec();

            if (!replyingComment) {
                return {
                    status: 'error',
                    code: 400,
                    message: 'Attempt to reply on a non-existent comment',
                };
            }

            // Verify that the comment has a thread since it'll be created if it doesn't...
            if (typeof replyingComment.thread === 'undefined') {
                Logger.error('Comment selected for replying should have a thread id...');

                return {
                    status: 'error',
                    code: 500,
                    message: errors.INTERNAL_SERVER_ERROR,
                };
            }

            thread = new mongoose.Types.ObjectId(replyingComment.thread.toString());
        }

        // If either the filename or the anchor is present on the comment, we need
        // to check that they are valid for the current submission....
        if (typeof filename !== 'undefined') {
            let archiveIndex = {
                userId: review.publication.owner._id.toString(),
                name: review.publication.name,
                ...(!review.publication.current && { revision: review.publication.revision }),
            };

            const archive = zip.loadArchive(archiveIndex);

            if (archive === null) {
                return {
                    status: 'error',
                    code: 500,
                    message: errors.INTERNAL_SERVER_ERROR,
                };
            }

            // check that the given filename exists within the publication...
            const entry = archive.getEntry(filename);

            if (!entry) {
                return {
                    status: 'error',
                    code: 400,
                    message: errors.BAD_REQUEST,
                    errors: {
                        filename: {
                            message: "Filename path doesn't exist in the current archive.",
                        },
                    } as ResponseErrorSummary,
                };
            }

            // If the anchor is specified, check that the line range makes sense, we don't have to
            // validate that both of the line numbers are semantically correct, but we do need to
            // check that both values exist in the file.
            if (typeof anchor !== 'undefined') {
                const lines = file.countLines(entry.getData().toString());

                // end + 1 is allowed since it might cover the last line and thus the anchor becomes ranged
                // to the last line and the the last line + 1
                if (anchor.start > lines || anchor.end > lines + 1) {
                    return {
                        status: 'error',
                        message: errors.BAD_REQUEST,
                        code: 400,
                        errors: {
                            anchor: { message: 'Anchor range is invalid.' },
                        } as ResponseErrorSummary,
                    };
                }
            }
        }

        const newComment = await new Comment({
            filename,
            anchor,
            contents,
            replying,
            review: req.params.id,
            thread,
            owner: req.requester.id,
            publication: review.publication.id as mongoose.Schema.Types.ObjectId,
        }).save();

        const populated = await newComment.populate<{ owner: IUserDocument }>('owner');

        return {
            status: 'ok',
            code: 201,
            data: {
                comment: Comment.project(populated),
            },
        };
    },
});

/**
 * @version v1.0.0
 * @method GET
 * @url /api/review/:id/comments
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/review/89183192381293/comments
 *
 * @description This endpoint is used to list the comments on a particular review specified
 * by the id of the review.
 *
 * @@TODO: Should be able to specify some filtration parameters with regards to which comments
 * should be listed from this endpoint. More specifically, we want to filter by owner, thread,
 * file, etc.
 */
registerRoute(router, '/:id/comments', {
    method: 'get',
    query: z.object({}),
    params: z.object({ id: ObjectIdSchema }),
    permissionVerification: verifyReviewPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const { id } = req.params;
        const { id: ownerId } = req.requester;

        const review = await Review.findById(id)
            .populate<{ owner: IUserDocument }>('owner')
            .populate<{ publication: IPublication }>('publication')
            .exec();

        // Check that the review exists and that the current commenter isn't trying
        // to publish comments on a non-public review. Only a review owner can comment
        // on a review whilst creating it.
        if (!review || (review.status === 'started' && review.owner.id !== ownerId)) {
            return {
                status: 'error',
                code: 404,
                message: errors.RESOURCE_NOT_FOUND,
            };
        }

        // check that the publication isn't in draft mode...
        if (review.publication.draft) {
            return {
                status: 'error',
                code: 400,
                message: 'Cannot comment on a drafted publication.',
            };
        }

        // Find all the comments on the current review...
        const result = await Comment.find({ review: review.id })
            .populate<{ owner: IUser }>('owner')
            .exec();

        const comments = result.map(Comment.project);

        return {
            status: 'ok',
            code: 200,
            data: {
                comments,
            },
        };
    },
});

/**
 * @version v1.0.0
 * @method POST
 * @url /api/review/:id/complete
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/review/89183192381293/complete
 *
 * @description This endpoint is used to signal that the owner of the review has finalised
 * their review and wishes to publish it on the platform.
 *
 */
registerRoute(router, '/:id/complete', {
    method: 'post',
    body: z.object({}),
    query: z.object({}),
    params: z.object({ id: ObjectIdSchema }),
    permissionVerification: verifyReviewPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const review = await Review.findByIdAndUpdate(req.params.id, {
            $set: { status: IReviewStatus.Completed },
        }).exec();

        // verify that the review exists and the owner is trying to publish it...
        if (!review) {
            return {
                status: 'error',
                code: 404,
                message: errors.RESOURCE_NOT_FOUND,
            };
        }

        return {
            status: 'ok',
            code: 200,
        };
    },
});

/**
 * @version v1.0.0
 * @method POST
 * @url /api/review/:id
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/review/89183192381293
 *
 * @description This endpoint is used to get a review specified by the id.
 *
 */
registerRoute(router, '/:id', {
    method: 'get',
    query: z.object({}),
    params: z.object({ id: ObjectIdSchema }),
    permissionVerification: verifyReviewPermission,
    permission: { level: IUserRole.Moderator },
    handler: async (req) => {
        const { id } = req.params;

        const review = (await Review.findById(id)
            .populate<{ publication: IPublication }>('publication')
            .populate<{ owner: IUserDocument }>('owner')
            .exec()) as unknown as PopulatedReview;

        if (!review) {
            return {
                status: 'error',
                code: 404,
                message: errors.RESOURCE_NOT_FOUND,
            };
        }

        return {
            status: 'ok',
            code: 200,
            data: {
                review: await Review.project(review),
            },
        };
    },
});

/**
 * @version v1.0.0
 * @method DELETE
 * @url /api/review/:id
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/review/89183192381293
 *
 * @description This endpoint is used to delete a review specified by it's id.
 *
 */
registerRoute(router, '/:id', {
    method: 'delete',
    query: z.object({}),
    params: z.object({ id: ObjectIdSchema }),
    permissionVerification: verifyReviewPermission,
    permission: { level: IUserRole.Administrator },
    handler: async (req) => {
        const { id } = req.params;

        // Delete the entire review and delete all the comments on the review...
        const review = await Review.findByIdAndDelete(id).exec();

        if (!review) {
            return {
                status: 'error',
                code: 404,
                message: errors.RESOURCE_NOT_FOUND,
            };
        }

        return {
            status: 'ok',
            code: 200,
        };
    },
});

export default router;
