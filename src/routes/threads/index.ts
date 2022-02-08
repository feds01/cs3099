import { z } from 'zod';
import express from 'express';
import { Schema } from 'mongoose';
import Comment from '../../models/Comment';
import * as errors from '../../common/errors';
import { IUserRole } from '../../models/User';
import registerRoute from '../../lib/requests';
import { ObjectIdSchema } from '../../validators/requests';
import { verifyCommentThreadPermission } from '../../lib/permissions';

const router = express.Router();

/**
 * @version v1.0.0
 * @method GET
 * @url /api/thread/:id
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/thread/:id
 *
 * @description get all comments in the thread with a given id
 *
 */
registerRoute(router, '/:id', {
    method: 'get',
    params: z.object({ id: ObjectIdSchema }),
    query: z.object({}),
    permissionVerification: verifyCommentThreadPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const { id } = req.params;
        const comments = Comment.find({ thread: new Schema.Types.ObjectId(id) });

        if (!comments) {
            return {
                status: 'error',
                code: 404,
                message: errors.NON_EXISTENT_THREAD,
            };
        }

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
 * @method DELETE
 * @url /api/thread/:id
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/thread/:id
 *
 * @description Delete all of the comments in the given thread
 *
 */
registerRoute(router, '/:id', {
    method: 'delete',
    params: z.object({ id: ObjectIdSchema }),
    query: z.object({}),
    permissionVerification: verifyCommentThreadPermission,
    permission: { level: IUserRole.Moderator },
    handler: async (req) => {
        const { id } = req.params;

        const thread = await Comment.deleteMany({ thread: new Schema.Types.ObjectId(id) }).exec();

        if (!thread) {
            return {
                status: 'error',
                code: 404,
                message: errors.RESOURCE_NOT_FOUND,
            };
        }

        return {
            status: 'ok',
            code: 204,
        };
    },
});

export default router;
