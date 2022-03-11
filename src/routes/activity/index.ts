import express from 'express';
import { z } from 'zod';

import * as error from '../../common/errors';
import registerRoute from '../../lib/communication/requests';
import Activity from '../../models/Activity';
import { IUserDocument, IUserRole } from '../../models/User';
import { PaginationQuerySchema } from '../../validators/pagination';
import { ObjectIdSchema } from '../../validators/requests';

const router = express.Router();

/**
 * @version v1.0.0
 * @method GET
 * @url /api/activity/:id
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/activity/89183192381293
 *
 * @description This endpoint is used to get the activity with the specified id.
 */
registerRoute(router, '/:id', {
    method: 'get',
    query: z.object({}),
    params: z.object({ id: ObjectIdSchema }),
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const activity = await Activity.findById(req.params.id)
            .populate<{ owner: IUserDocument }>('owner')
            .exec();

        if (!activity) {
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
                activity: Activity.project(activity),
            },
        };
    },
});

/**
 * @version v1.0.0
 * @method GET
 * @url /api/activity
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/activity?user=89183192381293&take=200&skip=1000
 *
 * @description This endpoint is used to get a paginated list of user activities specified
 * by the user id that's provided in the query.
 */
registerRoute(router, '/', {
    method: 'get',
    params: z.object({}),
    query: z.object({ user: ObjectIdSchema }).merge(PaginationQuerySchema),
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const activities = await Activity.find({ owner: req.query.user })
            .populate<{ owner: IUserDocument }>('owner')
            .skip(req.query.skip)
            .limit(req.query.take)
            .exec();

        if (!activities) {
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
                activities: await Promise.all(
                    activities.map(async (activity) => await Activity.project(activity)),
                ),
            },
        };
    },
});

export default router;
