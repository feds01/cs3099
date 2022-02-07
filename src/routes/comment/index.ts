import { z } from 'zod';
import express from 'express';
import * as error from '../../common/errors';
import registerRoute from '../../lib/requests';
import Comment from '../../models/Comment';
import { IUserDocument, IUserRole } from '../../models/User';
import { ObjectIdSchema } from '../../validators/requests';
import { verifyCommentPermission } from '../../lib/permissions';

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
    permissionVerification: verifyCommentPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const { id } = req.params;

        const comment = await Comment.findById(id)
            .populate<{ owner: IUserDocument }>('owner')
            .exec();

        if (!comment) {
            return {
                status: 'error',
                code: 404,
                message: error.NON_EXISTENT_COMMENT,
            };
        }

        return {
            status: 'ok',
            code: 200,
            data: {
                comment: Comment.project(comment),
            }
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
    body: z.object({ contents: z.string().min(1) }),
    params: z.object({ id: ObjectIdSchema }),
    permissionVerification: verifyCommentPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const { id } = req.params;
        const { contents } = req.body;

        // Patch the comment here and set the state of the comment as 'edited'
        const updatedComment = await Comment.findByIdAndUpdate(
            id,
            { contents, edited: true },
            { new: true },
        )
            .populate<{ owner: IUserDocument }>('owner')
            .exec();

        if (!updatedComment) {
            return {
                status: 'error',
                code: 404,
                message: error.NON_EXISTENT_COMMENT,
            };
        }

        return {
            status: 'ok',
            code: 200,
            data: {
                comment: Comment.project(updatedComment),
            }
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
    permissionVerification: verifyCommentPermission,
    permission: { level: IUserRole.Administrator },
    handler: async (req) => {
        const { id } = req.params;

        // @@Future: We shouldn't actually delete the comment, what we should do is remove
        //           the content from the comment and mark it as deleted.
        //           It cannot be further edited, and should be rendered as *deleted* on the frontend.
        const comment = await Comment.findByIdAndDelete(id).exec();

        if (!comment) {
            return {
                status: 'error',
                code: 404,
                message: error.NON_EXISTENT_COMMENT,
            };
        }

        return {
            status: 'ok',
            code: 200,
        };
    },
});

export default router;
