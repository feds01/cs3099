import express from 'express';
import { z } from 'zod';

import {
    defaultPermissionVerifier,
    verifyNotificationPermission,
} from '../../lib/communication/permissions';
import registerRoute from '../../lib/communication/requests';
import Notification from '../../models/Notification';
import { IUser, IUserRole } from '../../models/User';
import { PaginationQuerySchema } from '../../validators/pagination';
import { ObjectIdSchema } from '../../validators/requests';

const router = express.Router();

/**
 * @version v1.0.0
 * @method GET
 * @url /api/notifications
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/notifications
 *
 * @description This endpoint is used to all of the notifications for the requester
 * that they have not viewed yet.
 */
registerRoute(router, '/', {
    method: 'get',
    query: PaginationQuerySchema,
    params: z.object({}),
    headers: z.object({}),
    permission: { level: IUserRole.Default },
    permissionVerification: defaultPermissionVerifier,
    handler: async (req) => {
        const notifications = await Notification.find({
            tagging: req.requester._id.toString(),
            isLive: true,
            viewed: false,
        })
            .populate<{ author: IUser }>('author')
            .populate<{ tagging: IUser }>('tagging')
            .limit(req.query.take)
            .skip(req.query.skip)
            .exec();

        return {
            status: 'ok',
            code: 200,
            data: {
                notifications: await Promise.all(
                    notifications.map(
                        async (notification) => await Notification.project(notification),
                    ),
                ),
            },
        };
    },
});

/**
 * @version v1.0.0
 * @method GET
 * @url /api/notifications/:id
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/notifications/89183192381293
 *
 * @description This endpoint is used to get a notification with the specified id.
 */
registerRoute(router, '/:id', {
    method: 'get',
    query: z.object({}),
    params: z.object({ id: ObjectIdSchema }),
    headers: z.object({}),
    permission: { level: IUserRole.Moderator },
    permissionVerification: verifyNotificationPermission,
    handler: async (req) => {
        return {
            status: 'ok',
            code: 200,
            data: {
                notification: await Notification.project(req.permissionData),
            },
        };
    },
});

/**
 * @version v1.0.0
 * @method POST
 * @url /api/notifications/:id
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/notifications/89183192381293
 *
 * @description This endpoint is used to update the 'viewed' status of a notification
 * to set it to being viewed.
 */
registerRoute(router, '/:id/view', {
    method: 'post',
    query: z.object({}),
    body: z.object({}),
    params: z.object({ id: ObjectIdSchema }),
    headers: z.object({}),
    permission: { level: IUserRole.Moderator },
    permissionVerification: verifyNotificationPermission,
    handler: async (req) => {
        // we need to update the 'viewed' flag on the notification
        await req.permissionData.updateOne({ $set: { viewed: true } });

        return {
            status: 'ok',
            code: 200,
        };
    },
});

export default router;
