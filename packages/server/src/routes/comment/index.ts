import assert from 'assert';
import express from 'express';
import { z } from 'zod';

import * as error from '../../common/errors';
import { verifyCommentPermission } from '../../lib/communication/permissions';
import registerRoute from '../../lib/communication/requests';
import { createNotification, findUserMentions } from '../../lib/notification';
import Comment from '../../models/Comment';
import Review, { IReviewStatus } from '../../models/Review';
import { IUserDocument, IUserRole } from '../../models/User';
import { setsEqual } from '../../utils/array';
import { ObjectIdSchema } from '../../validators/requests';

const router = express.Router();

/**
 * @version v1.0.0
 * @method GET
 * @url /api/comment/:id
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/comment/89183192381293
 *
 * @description This endpoint is used to get the comment with the specified id.
 */
registerRoute(router, '/:id', {
    method: 'get',
    query: z.object({}),
    params: z.object({ id: ObjectIdSchema }),
    headers: z.object({}),
    permissionVerification: verifyCommentPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const comment = await Comment.findById(req.params.id)
            .populate<{ owner: IUserDocument }>('owner')
            .exec();

        if (!comment) {
            return {
                status: 'error',
                code: 404,
                message: error.RESOURCE_NOT_FOUND,
            };
        }

        return {
            status: 'ok',
            code: 200,
            data: {
                comment: Comment.project(comment),
            },
        };
    },
});

/**
 * @version v1.0.0
 * @method PATCH
 * @url /api/comment/:id
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/comment/89183192381293
 *
 * >>> response:
 * {
 *  "status": "ok",
 *  "comment": {
 *      "name": "william"
 *      ...
 *  }
 * }
 *
 * @description Method to patch the contents of a comment. Once a comment is updated once, the
 * "edited" flag is set to true on the comment so that the UI can reflect that that the comment
 * has been modified from it's original state.
 *
 * @error {UNAUTHORIZED} if the user doesn't have permissions to edit the comment.
 *
 * @return sends the newly patched comment back
 */
registerRoute(router, '/:id', {
    method: 'patch',
    query: z.object({}),
    headers: z.object({}),
    body: z.object({ contents: z.string().min(1) }),
    params: z.object({ id: ObjectIdSchema }),
    permissionVerification: verifyCommentPermission,
    permission: { level: IUserRole.Moderator, hierarchy: true },
    handler: async (req) => {
        // Patch the comment here and set the state of the comment as 'edited'
        const updatedComment = await Comment.findByIdAndUpdate(
            req.params.id,
            { contents: req.body.contents, edited: true },
            { new: true },
        )
            .populate<{ owner: IUserDocument }>('owner')
            .exec();

        assert(updatedComment !== null);

        const oldMentions = findUserMentions(req.permissionData.contents);
        const mentions = findUserMentions(req.body.contents);

        if (!setsEqual(oldMentions, mentions)) {
            // we need to fetch the review to find it's status
            const review = await Review.findById(updatedComment.review).exec();
            assert(review !== null);

            // We want to create any new notifications on the comment if they have tagged the user
            await Promise.all(
                [...findUserMentions(req.body.contents)].map(async (mention) => {
                    await createNotification(
                        mention,
                        req.params.id,
                        req.requester,
                        updatedComment._id,
                        review.status === IReviewStatus.Completed,
                    );
                }),
            );
        }

        return {
            status: 'ok',
            code: 200,
            data: {
                comment: Comment.project(updatedComment),
            },
        };
    },
});

/**
 * @version v1.0.0
 * @method DELETE
 * @url /api/comment/:id
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/comment/89183192381293
 *
 * @description This endpoint is used to delete a comment with the specified id. The endpoint
 * verifies that you must be an administrator to delete comments or the owner of the comment.
 *
 * @error {UNAUTHORIZED} if the user doesn't have permissions to delete the comment.
 */
registerRoute(router, '/:id', {
    method: 'delete',
    query: z.object({}),
    params: z.object({ id: ObjectIdSchema }),
    headers: z.object({}),
    permissionVerification: verifyCommentPermission,
    permission: { level: IUserRole.Administrator },
    handler: async (req) => {
        const comment = await Comment.findByIdAndDelete(req.params.id).exec();

        if (!comment) {
            return {
                status: 'error',
                code: 404,
                message: error.RESOURCE_NOT_FOUND,
            };
        }

        return {
            status: 'ok',
            code: 200,
        };
    },
});

export default router;
