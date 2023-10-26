import express from 'express';
import { z } from 'zod';

import {
    defaultPermissionVerifier,
    generateComprehensiveRoleList,
    verifyActivityPermission,
} from '../../lib/communication/permissions';
import registerRoute from '../../lib/communication/requests';
import Activity from '../../models/Activity';
import Follower from '../../models/Follower';
import { IUser, IUserRole } from '../../models/User';
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
    headers: z.object({}),
    permission: { level: IUserRole.Default },
    permissionVerification: verifyActivityPermission,
    handler: async (req) => {
        return {
            status: 'ok',
            code: 200,
            data: {
                activity: await Activity.project(req.permissionData),
            },
        };
    },
});

/**
 * @version v1.0.0
 * @method GET
 * @url /api/activity
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/activity
 *
 * @description This endpoint is used to get a paginated list of user activities specified
 * by the user id that's provided within the requester. This is essentially the activity feed
 * of the user so that it can fetch the activities of the users that they follow.
 */
registerRoute(router, '/', {
    method: 'get',
    params: z.object({}),
    query: PaginationQuerySchema,
    headers: z.object({}),
    permission: { level: IUserRole.Default },
    permissionVerification: defaultPermissionVerifier,
    handler: async (req) => {
        const { skip, take } = req.query;

        // We need to find all of the users that the requester is following and we essentially
        // treat those 'followers' as sources of activity so that we can aggregate them and
        // then sort them by the time that they occurred from.
        const sources = await Follower.find({ follower: req.requester._id.toString() }).exec();
        const roles = generateComprehensiveRoleList(req.requester.role);

        const activities = await Activity.find({
            isLive: true,
            owner: { $in: sources.map((source) => source.following) },
            permission: { $in: roles },
        })
            .populate<{ owner: IUser }>('owner')
            .sort({ _id: -1 })
            .skip(skip)
            .limit(take)
            .exec();

        return {
            status: 'ok',
            code: 200,
            data: {
                activities: await Promise.all(
                    activities.map(async (activity) => await Activity.project(activity)),
                ),
                skip,
                take,
                total: 0, // @@PaginationTotal: use accurate figure
            },
        };
    },
});

export default router;
