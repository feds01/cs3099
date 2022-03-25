import express from 'express';
import { z } from 'zod';

import { verifyUserPermission } from '../../lib/communication/permissions';
import registerRoute from '../../lib/communication/requests';
import Activity from '../../models/Activity';
import { IUserRole } from '../../models/User';
import { ActivityAggregation } from '../../types/aggregation';
import { PaginationQuerySchema } from '../../validators/pagination';
import { ModeSchema } from '../../validators/requests';

const router = express.Router({ mergeParams: true });

/**
 * @version v1.0.0
 * @method GET
 * @url /api/user/:id/feed
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/user/616f115feb325663f8bce3a4/feed
 *
 * @description This route is used to get a user's activity feed, this will collect
 * activities and information from what the user has been doing.
 *
 * @error {SELF_FOLLOWING} if the user account is trying to follow itself.
 * @error {NON_EXISTENT_USER} if the specified user does not exist.
 *
 * */
registerRoute(router, '/:username/feed', {
    method: 'get',
    params: z.object({ username: z.string() }),
    query: z.object({ mode: ModeSchema }).merge(PaginationQuerySchema),
    headers: z.object({}),
    permissionVerification: verifyUserPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const { skip, take } = req.query;

        const aggregation = (await Activity.aggregate([
            {
                $facet: {
                    data: [
                        { $match: { isLive: true, owner: req.permissionData._id } },
                        { $sort: { _id: -1 } },
                        { $skip: skip },
                        { $limit: take },
                    ],
                    total: [{ $count: 'total' }],
                },
            },
            {
                $project: {
                    data: 1,
                    // Get total from the first element of the metadata array
                    total: { $arrayElemAt: ['$total.total', 0] },
                },
            },
        ])) as unknown as [ActivityAggregation];

        const result = aggregation[0];

        return {
            status: 'ok',
            code: 200,
            data: {
                activities: await Promise.all(
                    result.data.map(
                        async (activity) =>
                            await Activity.projectWith(activity, req.permissionData),
                    ),
                ),
                skip: req.query.skip,
                take: req.query.take,
                total: result.total ?? 0,
            },
        };
    },
});

export default router;
