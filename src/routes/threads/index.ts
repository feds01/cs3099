import { z } from 'zod';
import express from 'express';
import { Schema } from 'mongoose';
import * as errors from '../../common/errors';
import Comment from '../../models/Comment';
import registerRoute from '../../lib/requests';
import { ObjectIdSchema } from '../../validators/requests';
import { IUserRole } from '../../models/User';

const router = express.Router();

// GET /thread/:id
// get all comments in the thread with a given id
registerRoute(router, '/:id', {
    method: 'get',
    params: z.object({ id: ObjectIdSchema }),
    query: z.object({}),
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const { id } = req.params;
        const comments = Comment.find({ thread: new Schema.Types.ObjectId(id) });

        if (!comments) {
            return res.status(404).json({
                status: 'error',
                message: errors.NON_EXISTENT_THREAD,
            });
        }

        return res.status(200).json({
            status: 'ok',
            comments,
        });
    },
});

// DELETE /thread/:id
// delete a thread with a given id
registerRoute(router, '/:id', {
    method: 'delete',
    params: z.object({ id: ObjectIdSchema }),
    query: z.object({}),
    permission: IUserRole.Moderator,
    handler: async (req, res) => {
        const { id } = req.params;

        const thread = await Comment.deleteMany({ thread: new Schema.Types.ObjectId(id) }).exec();

        if (!thread) {
            return res.status(404).json({
                status: 'error',
                extra: errors.NON_EXISTENT_THREAD,
            });
        }

        return res.status(204).json({
            status: 'ok',
            message: 'Successfully deleted thread',
        });
    },
});

export default router;
