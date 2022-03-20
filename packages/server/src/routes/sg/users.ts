import express from 'express';
import { z } from 'zod';

import * as errors from '../../common/errors';
import registerRoute from '../../lib/communication/requests';
import User from '../../models/User';
import { config } from '../../server';
import { convertSgId } from '../../transformers/sg';
import { SgUserIdSchema } from '../../validators/sg';

const router = express.Router();

/**
 * @version v1.0.0
 * @method GET
 * @url /api/sg/users/:id
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/sg/user/61f9c5a7f90225c567f389fc
 *
 * >>> response:
 * {
 *  "status": "ok",
 *  "name": "william"
 *      ...
 *  }
 * }
 *
 * @description This route is used to fetch information about a user account, the route
 * will accept a token in the header of the request to authenticate the request.
 *
 * @see https://app.swaggerhub.com/apis/feds01/supergroup-c_api/1.0.0#/users/get_api_sg_users__id_
 *
 * @return sends the user object to the client.
 * */
registerRoute(router, '/:id', {
    method: 'get',
    params: z.object({ id: SgUserIdSchema }),
    query: z.object({}),
    headers: z.object({}),
    permission: null,
    permissionVerification: undefined,
    handler: async (req) => {
        const { id, group } = req.params.id;

        if (group !== config.teamName) {
            return {
                status: 'error',
                code: 400,
                message:
                    'Cannot retrieve information about user that is located in an external service.',
            };
        }

        const user = await User.findById(id).exec();

        if (!user) {
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
                id: convertSgId(req.params.id),
                ...User.projectAsSg(user),
            },
        };
    },
});

export default router;
