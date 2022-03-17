import express from 'express';
import { z } from 'zod';

import { verifyPublicationIdPermission } from '../../../lib/communication/permissions';
import registerRoute from '../../../lib/communication/requests';
import { IUserRole } from '../../../models/User';
import { ObjectIdSchema } from '../../../validators/requests';
import PublicationController from '../../../controller/publication';

const router = express.Router();

/**
 * @version v1.0.0
 * @method GET
 * @url /api/publication-by-id/:id/reviews
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication/feds01/zap/v1/reviews
 *
 * @description This endpoint is used to list all of the reviews on a specific publication
 * which is specified by the owner's username, publication name and publication revision.
 *
 */
registerRoute(router, '/:id/reviews', {
    method: 'get',
    params: z.object({ id: ObjectIdSchema }),
    query: z.object({}),
    headers: z.object({}),
    permissionVerification: verifyPublicationIdPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const controller = new PublicationController(req.permissionData);
        return await controller.reviews();
    },
});

/**
 * @version v1.0.0
 * @method POST
 * @url /api/publication-by-id/:id/review
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication-by-id/foo/review
 *
 * @description This endpoint is used to initiate the process of reviewing a publication.
 * It sets up the necessary information in the database for a review of a publication to start.
 *
 */
registerRoute(router, '/:id/review', {
    method: 'post',
    params: z.object({ id: ObjectIdSchema }),
    body: z.object({}),
    query: z.object({}),
    headers: z.object({}),
    permissionVerification: verifyPublicationIdPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const controller = new PublicationController(req.permissionData);
        const requesterId = req.requester._id!.toString();

        return await controller.createReview(requesterId);
    },
});

export default router;
