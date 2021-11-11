import { z } from 'zod';
import express from 'express';
import * as error from '../../common/errors';
import registerRoute from '../../lib/requests';
import Comment from '../../models/Comment';
import { IUserRole } from '../../models/User';
import { ObjectIdSchema } from '../../validators/requests';

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
