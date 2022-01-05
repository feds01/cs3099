import { z } from 'zod';
import express from 'express';
import * as error from '../../common/errors';
import registerRoute from '../../lib/requests';
import Comment from '../../models/Comment';
import { IUserDocument, IUserRole } from '../../models/User';
import { ObjectIdSchema } from '../../validators/requests';
import assert from 'assert';

const router = express.Router();

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

        const comment = await Comment.findById(id)
            .populate<{ owner: IUserDocument }[]>('owner')
            .exec();

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
 * @version v1.0.0
 * @method PATCH
 * @url /api/comment/:id
 * @example
 * https://af268.cs.st-andrews.ac.uk/api/comment/89183192381293
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
registerRoute(router, '/comment/:id', {
    method: 'patch',
    query: z.object({}),
    body: z.object({ contents: z.string().min(1) }),
    params: z.object({ id: ObjectIdSchema }),
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const { id } = req.params;
        const { contents } = req.body;

        const comment = await Comment.findById(id)
            .populate<{ owner: IUserDocument }[]>('owner')
            .exec();

        if (!comment) {
            return res.status(404).json({
                status: 'error',
                message: error.NON_EXISTENT_COMMENT,
            });
        }

        // Patch the comment here and set the state of the comment as 'edited'
        const updatedComment = await Comment.findOneAndUpdate({ id: comment.id }, { $set: { contents, edited: true } }, { new: true }).exec();
        assert(updatedComment !== null);

        return res.status(200).json({
            status: true,
            comment: Comment.project(updatedComment),
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
            message: 'Successfully deleted comment.',
        });
    },
});

export default router;
