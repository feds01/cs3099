import { z } from 'zod';
import express from 'express';
import mongoose from 'mongoose';
import Logger from '../../common/logger';
import * as error from '../../common/errors';
import registerRoute from '../../lib/requests';
import Comment from '../../models/Comment';
import Review from '../../models/Review';
import { IUser, IUserRole } from '../../models/User';
import { ObjectIdSchema } from '../../validators/requests';
import { ICommentCreationSchema } from '../../validators/comments';
import { IPublication } from '../../models/Publication';

const router = express.Router();

/**
 *
 */
registerRoute(router, '/comment', {
    method: 'put',
    body: ICommentCreationSchema,
    query: z.object({}),
    params: z.object({}),
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const { review: reviewId, replying, filename, anchor, contents } = req.body;
        const { id: owner } = req.requester;

        const review = await Review.findById(reviewId)
            .populate<{ owner: IUser }>('owner')
            .populate<{ publication: IPublication }>('publication')
            .exec();

        // Check that the review exists and that the current commenter isn't trying
        // to publish comments on a non-public review. Only a review owner can comment
        // on a review whilst creating it.
        if (
            !review ||
            (review.status === 'started' &&
                (review.owner as unknown as IUser & { id: string }).id !== owner)
        ) {
            return res.status(404).json({
                status: 'error',
                message: error.NON_EXISTENT_REVIEW,
            });
        }

        // check that the publication isn't in draft mode...
        if (review.publication.draft) {
            return res.status(400).json({
                status: 'error',
                message: 'Cannot comment on a drafted publication.',
            });
        }

        // Check if the thread is replying to another comment
        let thread = new mongoose.Types.ObjectId();

        if (typeof replying !== 'undefined') {
            const replyingComment = await Comment.findById(replying).exec();

            if (!replyingComment) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Attempt to reply on a non-existent comment',
                });
            }

            // Verify that the comment has a thread since it'll be created if it doesn't...
            if (typeof replyingComment.thread === 'undefined') {
                Logger.error('Comment selected for replying should have a thread id...');

                return res.status(500).json({
                    status: 'error',
                    message: error.INTERNAL_SERVER_ERROR,
                });
            }

            thread = new mongoose.Types.ObjectId(replyingComment.thread.toString());
        }

        // If either the filename or the anchor is present on the comment, we need
        // to check that they are valid for the current submission....
        if (typeof filename !== 'undefined') {
            if (typeof anchor !== 'undefined') {
                console.log('filename and anchor!');
            } else {
                console.log('just filename');
            }
        }

        const newComment = new Comment({
            filename,
            anchor,
            contents,
            replying,
            review: reviewId,
            thread,
        });

        try {
            await newComment.save();

            return res.status(201).json({
                status: 'ok',
                message: 'Created comment.',
                comment: Comment.project(newComment),
            });
        } catch (e) {
            Logger.error(e);

            return res.status(500).json({
                status: 'error',
                message: error.INTERNAL_SERVER_ERROR,
            });
        }
    },
});

/**
 *
 */
registerRoute(router, '/comment/:id', {
    method: 'get',
    query: z.object({}),
    params: z.object({ id: ObjectIdSchema }),
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const { id } = req.params;

        const comment = await Comment.findById(id).exec();

        if (!comment) {
            return res.status(404).json({
                status: 'error',
                message: error.NON_EXISTENT_COMMENT,
            });
        }

        return res.status(200).json({
            status: true,
            comment: Comment.project(comment),
        });
    },
});

/**
 *
 */
registerRoute(router, '/comment/:id', {
    method: 'delete',
    query: z.object({}),
    params: z.object({ id: ObjectIdSchema }),
    permission: IUserRole.Moderator,
    handler: async (req, res) => {
        const { id } = req.params;

        // @@Future: We shouldn't actually delete the comment, what we should do is remove
        //           the content from the comment and mark it as deleted.
        //           It cannot be further edited, and should be rendered as *deleted* on the frontend.
        const comment = await Comment.findByIdAndDelete(id).exec();

        if (!comment) {
            return res.status(404).json({
                status: 'error',
                message: error.NON_EXISTENT_COMMENT,
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Successfully deleted user account.',
        });
    },
});

export default router;
