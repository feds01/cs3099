import express from 'express';
import { z } from 'zod';

import * as userUtils from '../../utils/users';
import registerRoute from '../../lib/communication/requests';
import Activity, { AugmentedActivityDocument } from '../../models/Activity';
import { IUserRole } from '../../models/User';
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
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const user = await userUtils.transformUsernameIntoId(req);

        const { skip, take } = req.query;

        type ActivityAggregation = {
            data: AugmentedActivityDocument[];
            total?: number;
        };

        const aggregation = (await Activity.aggregate([
            {
                $facet: {
                    data: [
                        { $match: { draft: false } },
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
                activities: result.data.map((activity) => Activity.projectWith(activity, user)),
                skip: req.query.skip,
                take: req.query.take,
                total: result.total ?? 0,
            },
        };
    },
});

export default router;
