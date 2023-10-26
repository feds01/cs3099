import express from 'express';
import { z } from 'zod';

import PublicationController from '../../../controller/publication';
import { verifyPublicationPermission } from '../../../lib/communication/permissions';
import registerRoute from '../../../lib/communication/requests';
import { IUserRole } from '../../../models/User';
import {
    PublicationByNameRequestSchema,
    PublicationRevisionSchema,
} from '../../../validators/publications';
import { ModeSchema } from '../../../validators/requests';

const router = express.Router();

/**
 * @version v1.0.0
 * @method GET
 * @url /api/publication/:username/:name/reviews
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication/feds01/zap/reviews
 *
 * @description This endpoint is used to list all of the reviews on a specific publication
 * which is specified by the owner's username, publication name and publication revision.
 *
 */
registerRoute(router, '/:username/:name/reviews', {
    method: 'get',
    params: PublicationByNameRequestSchema,
    query: z.object({ mode: ModeSchema, revision: PublicationRevisionSchema }),
    headers: z.object({}),
    permissionVerification: verifyPublicationPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const controller = new PublicationController(req.permissionData);
        return await controller.reviews(req.requester);
    },
});

/**
 * @version v1.0.0
 * @method POST
 * @url /api/publication/:username/:name/:revision/review
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication/feds01/zap/review
 *
 * @description This endpoint is used to initiate the process of reviewing a publication.
 * It sets up the necessary information in the database for a review of a publication to start.
 *
 */
registerRoute(router, '/:username/:name/review', {
    method: 'post',
    body: z.object({}),
    query: z.object({ mode: ModeSchema, revision: PublicationRevisionSchema }),
    headers: z.object({}),
    params: PublicationByNameRequestSchema,
    permissionVerification: verifyPublicationPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const controller = new PublicationController(req.permissionData);
        const requesterId = req.requester._id!.toString();

        return await controller.createReview(requesterId);
    },
});

export default router;
