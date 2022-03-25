import assert from 'assert';
import express from 'express';
import { z } from 'zod';

import PublicationController, { PublicationResponse } from '../../../controller/publication';
import { verifyPublicationIdPermission } from '../../../lib/communication/permissions';
import registerRoute from '../../../lib/communication/requests';
import { IActivityOperationKind, IActivityType } from '../../../models/Activity';
import { IUserRole } from '../../../models/User';
import { IPublicationPatchRequestSchema } from '../../../validators/publications';
import { FlagSchema, ObjectIdSchema, ResourceSortSchema } from '../../../validators/requests';
import reviewRouter from './reviews';

const router = express.Router();
router.use('/', reviewRouter);

/**
 * @version v1.0.0
 * @method GET
 * @url /api/publication-by-id/:id
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication-by-id/507f1f77bcf86cd799439011
 *
 * @description This endpoint is used to get a publication by the name of the owner
 * and the name of the publication.
 */
registerRoute(router, '/:id', {
    method: 'get',
    params: z.object({
        id: ObjectIdSchema,
    }),
    query: z.object({}),
    headers: z.object({}),
    permissionVerification: verifyPublicationIdPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const controller = new PublicationController(req.permissionData);
        return await controller.get();
    },
});

/**
 * @version v1.0.0
 * @method DELETE
 * @url /api/publication-by-id/:id
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication-by-id/507f1f77bcf86cd799439011
 *
 * @description This endpoint is used to delete a specific revision of a publication.
 * Optionally, it can be which revision should be deleted (by passing the revision in
 * the query parameters). The endpoint also filters for if the publication is a draft
 * or not.
 */
registerRoute(router, '/:id', {
    method: 'delete',
    params: z.object({
        id: ObjectIdSchema,
    }),
    query: z.object({}),
    headers: z.object({}),
    permissionVerification: verifyPublicationIdPermission,
    activity: { kind: IActivityOperationKind.Delete, type: IActivityType.Publication },
    activityMetadataFn: async (_requester, request, _res) => {
        assert(request.permissionData !== null);

        return {
            liveness: true,
            metadata: {
                name: request.permissionData.name,
                revision: request.permissionData.revision,
            },
        };
    },
    permission: { level: IUserRole.Administrator },
    handler: async (req) => {
        const controller = new PublicationController(req.permissionData);
        return await controller.delete();
    },
});

/**
 * @version v1.0.0
 * @method PATCH
 * @url /api/publication-by-id/:id
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication-by-id/507f1f77bcf86cd799439011
 *
 * @description This endpoint is used to patch a publication with the new details about the publication.
 */
registerRoute(router, '/:id', {
    method: 'patch',
    params: z.object({
        id: ObjectIdSchema,
    }),
    query: z.object({}),
    body: IPublicationPatchRequestSchema,
    headers: z.object({}),
    permissionVerification: verifyPublicationIdPermission,
    permission: { level: IUserRole.Moderator },
    handler: async (req) => {
        const controller = new PublicationController(req.permissionData);
        return await controller.patch(req.body);
    },
});

/**
 * @version v1.0.0
 * @method POST
 * @url /api/publication-by-id/:id/revise
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication-by-id/507f1f77bcf86cd799439011/revise
 *
 * @description This endpoint is used to create a revision of a publication from a previous
 * publication. The endpoint accepts a new revision tag that should be unique from all of the
 * publications in the current stream. This will copy the information from the most recent
 * publication and then create a new one, set it to the current one and then perform some other
 * administrative tasks when revising the publication.
 */
registerRoute(router, '/:id/revise', {
    method: 'post',
    params: z.object({
        id: ObjectIdSchema,
    }),
    query: z.object({}),
    body: z.object({ revision: z.string(), changelog: z.string() }),
    headers: z.object({}),
    activity: {
        kind: IActivityOperationKind.Revise,
        type: IActivityType.Publication,
        permission: IUserRole.Default,
    },
    activityMetadataFn: async (_requester, req, response: PublicationResponse | undefined) => {
        assert(typeof response !== 'undefined');
        assert(req.permissionData !== null);

        return {
            document: response.publication._id,
            metadata: {
                oldRevision: req.permissionData.revision,
                newRevision: req.body!.revision,
                name: req.permissionData.name,
                owner: req.permissionData.owner.username,
            },
            // This event will be flagged as live when the user uploads a publication file to it
            liveness: false,
        };
    },
    permissionVerification: verifyPublicationIdPermission,
    permission: { level: IUserRole.Moderator },
    handler: async (req) => {
        const controller = new PublicationController(req.permissionData);
        return await controller.revise(req.body.revision, req.body.changelog);
    },
});

/**
 * @version v1.0.0
 * @method GET
 * @url /api/publication-by-id/:id/tree/:path*
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication-by-id/507f1f77bcf86cd799439011/tree/blahblah
 *
 * @description This endpoint is used to get all of the files for a publication
 * specified by the owner's name, the name of the publication and which revision of the publication
 * to index.
 */
registerRoute(router, '/:id/tree/:path(*)', {
    method: 'get',
    params: z.object({
        id: ObjectIdSchema,
        path: z.string().optional(),
    }),
    query: z.object({
        sortBy: ResourceSortSchema,
    }),
    headers: z.object({}),
    permissionVerification: verifyPublicationIdPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const controller = new PublicationController(req.permissionData);
        return await controller.tree(req.params.path ?? '', req.query.sortBy);
    },
});

/**
 * @version v1.0.0
 * @method POST
 * @url /api/publication-by-id/:id/export
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication-by-id/507f1f77bcf86cd799439011/export
 *
 * @description This endpoint is used to initiate the exporting process for a publication. The endpoint
 * takes to required parameters which specify to where the publication should be exported and
 * if the export should also export reviews with the publication.
 */
registerRoute(router, '/:id/export', {
    method: 'post',
    params: z.object({
        id: ObjectIdSchema,
    }),
    headers: z.object({}),
    body: z.object({}),
    query: z.object({
        to: z.string().url(),
        exportReviews: FlagSchema,
    }),
    permissionVerification: verifyPublicationIdPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const controller = new PublicationController(req.permissionData);
        const requesterId = req.requester._id?.toString()!;

        return await controller.export(req.query.to, requesterId, req.query.exportReviews);
    },
});

/**
 * @version v1.0.0
 * @method GET
 * @url /publication-by-id/:id/sources
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication-by-id/507f1f77bcf86cd799439011/sources?revision=v1
 *
 * @description This endpoint is used to get all of the files for a publication
 * specified by the owner's name, the name of the publication and which revision of the publication
 * to index.
 */
registerRoute(router, '/:id/sources', {
    method: 'get',
    params: z.object({
        id: ObjectIdSchema,
    }),
    headers: z.object({}),
    query: z.object({ revision: z.string() }),
    permissionVerification: verifyPublicationIdPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const controller = new PublicationController(req.permissionData);
        return await controller.sources();
    },
});

export default router;
