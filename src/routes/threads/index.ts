import * as errors from '../../common/errors';
import { verifyCommentThreadPermission } from '../../lib/permissions';
import registerRoute from '../../lib/requests';
import Comment from '../../models/Comment';
import { IUserRole } from '../../models/User';
import { ObjectIdSchema } from '../../validators/requests';

import express from 'express';
import { Schema } from 'mongoose';
import { z } from 'zod';

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
                message: errors.RESOURCE_NOT_FOUND,
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
