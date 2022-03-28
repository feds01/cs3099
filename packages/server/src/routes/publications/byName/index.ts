import assert from 'assert';
import express from 'express';
import { z } from 'zod';

import * as errors from '../../../common/errors';
import * as zip from '../../../lib/resources/zip';
import * as userUtils from '../../../utils/users';
import PublicationController, { PublicationResponse } from '../../../controller/publication';
import {
    verifyPublicationPermission,
    verifyRevisonlessPublicationPermission,
    verifyUserPermission,
} from '../../../lib/communication/permissions';
import registerRoute from '../../../lib/communication/requests';
import { deleteResource } from '../../../lib/resources/fs';
import { IActivityOperationKind, IActivityType } from '../../../models/Activity';
import Publication from '../../../models/Publication';
import { IUser, IUserRole } from '../../../models/User';
import { PublicationAggregation } from '../../../types/aggregation';
import { PaginationQuerySchema } from '../../../validators/pagination';
import { IPublicationPatchRequestSchema } from '../../../validators/publications';
import { FlagSchema, ModeSchema, ResourceSortSchema } from '../../../validators/requests';
import reviewRouter from './reviews';

const router = express.Router();
router.use('/', reviewRouter);

/**
 * @version v1.0.0
 * @method GET
 * @url /api/publication/:username
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication/feds01
 *
 * @description This endpoint is used to get all of the publications under the current
 * user.
 */
registerRoute(router, '/:username', {
    method: 'get',
    params: z.object({ username: z.string() }),
    query: z
        .object({
            mode: ModeSchema,
            pinned: FlagSchema.optional(),
            asCollaborator: FlagSchema.optional(),
            current: FlagSchema.optional().default('true'),
        })
        .merge(PaginationQuerySchema),
    headers: z.object({}),
    permissionVerification: verifyUserPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const user = req.permissionData;
        const { pinned, skip, take, asCollaborator, current } = req.query;

        // We are performing an aggregation to collect all publications where the user is the
        // owner (or a collaborator which is optionally specified in the request query), whether
        // the publication has a `pinned` status and only current publications
        const aggregation = (await Publication.aggregate([
            {
                $facet: {
                    data: [
                        {
                            $match: {
                                $or: [
                                    { owner: user._id },
                                    ...(typeof asCollaborator !== 'undefined' && asCollaborator
                                        ? [
                                              {
                                                  collaborators: {
                                                      $elemMatch: { $eq: user._id },
                                                  },
                                              },
                                          ]
                                        : []),
                                ],
                                ...(typeof pinned !== 'undefined' && {
                                    $or: [
                                        ...(!pinned ? [{ pinned: { $exists: false } }] : []),
                                        { pinned },
                                    ],
                                }),
                                current,
                            },
                        },
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
        ])) as unknown as [PublicationAggregation];

        const result = aggregation[0];

        return {
            status: 'ok',
            code: 200,
            data: {
                publications: await Promise.all(
                    result.data.map(async (publication) => await Publication.project(publication)),
                ),
                total: result.total ?? 0,
                skip,
                take,
            },
        };
    },
});

/**
 * @version v1.0.0
 * @method GET
 * @url /api/publication/:username/:name/revisions
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication/feds01/zap/revisions
 *
 * @description This endpoint is used to get all of the revisions for a given publication.
 */
registerRoute(router, '/:username/:name/revisions', {
    method: 'get',
    params: z.object({ username: z.string(), name: z.string() }),
    query: z.object({ mode: ModeSchema }).merge(PaginationQuerySchema),
    headers: z.object({}),
    permissionVerification: verifyRevisonlessPublicationPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const user = await userUtils.transformUsernameIntoId(req);

        const { skip, take } = req.query;
        const result = await Publication.find({
            owner: user.id,
            name: req.params.name,
        })
            .sort({ _id: -1 })
            .skip(skip)
            .limit(take)
            .exec();

        return {
            status: 'ok',
            code: 200,
            data: {
                revisions: await Promise.all(
                    result.map(
                        async (publication) => await Publication.projectWith(publication, user),
                    ),
                ),
                skip,
                take,
            },
        };
    },
});

/**
 * @version v1.0.0
 * @method DELETE
 * @url /api/publication/:username/:name/all
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication/feds01/zap/all
 *
 * @description This endpoint is used to delete a publication and any found revision
 * of the publication.
 */
registerRoute(router, '/:username/:name/all', {
    method: 'delete',
    params: z.object({
        username: z.string().nonempty(),
        name: z.string().nonempty(),
    }),
    query: z.object({ mode: ModeSchema }),
    headers: z.object({}),
    permissionVerification: verifyPublicationPermission,
    permission: { level: IUserRole.Administrator },
    handler: async (req) => {
        const user = await userUtils.transformUsernameIntoId(req);
        const name = req.params.name.toLowerCase();

        // Since we have cascading deletes, all reviews and comments are deleted.
        await Publication.deleteMany({ owner: user.id, name }).exec();

        const publicationPath = zip.resourceIndexToPath({
            type: 'publication',
            owner: user.id,
            name,
        });

        // we need to try to remove the folder that stores the publications...
        await deleteResource(publicationPath);

        return { status: 'ok', code: 200 };
    },
});

/**
 * @version v1.0.0
 * @method GET
 * @url /api/publication/:username/:name
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication/feds01/zap
 *
 * @description This endpoint is used to get a publication by the name of the owner
 * and the name of the publication.
 */
registerRoute(router, '/:username/:name', {
    method: 'get',
    params: z.object({
        username: z.string().nonempty(),
        name: z.string().nonempty(),
    }),
    query: z.object({
        mode: ModeSchema,
        revision: z.string().optional(),
    }),
    headers: z.object({}),
    permissionVerification: verifyPublicationPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const controller = new PublicationController(req.permissionData);
        return await controller.get();
    },
});

/**
 * @version v1.0.0
 * @method DELETE
 * @url /api/publication/:username/:name
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication/feds01/zap
 *
 * @description This endpoint is used to delete a specific revision of a publication.
 * Optionally, it can be which revision should be deleted (by passing the revision in
 * the query parameters). The endpoint also filters for if the publication is a draft
 * or not.
 */
registerRoute(router, '/:username/:name', {
    method: 'delete',
    params: z.object({
        username: z.string().nonempty(),
        name: z.string().nonempty(),
    }),
    query: z.object({
        mode: ModeSchema,
        revision: z.string().optional(),
    }),
    headers: z.object({}),
    activity: { kind: IActivityOperationKind.Delete, type: IActivityType.Publication },
    activityMetadataFn: async (_requester, request, _res) => {
        assert(request.permissionData !== null);

        // We want to collect the revision and name when recording the activity
        return {
            liveness: true,
            metadata: {
                name: request.permissionData.name,
                revision: request.permissionData.revision,
            },
        };
    },
    permissionVerification: verifyPublicationPermission,
    permission: { level: IUserRole.Administrator },
    handler: async (req) => {
        const controller = new PublicationController(req.permissionData);
        return await controller.delete();
    },
});

/**
 * @version v1.0.0
 * @method PATCH
 * @url /api/publication/:username/:name
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication/feds01/zap
 *
 * @description This endpoint is used to patch a publication with the new details about the publication.
 */
registerRoute(router, '/:username/:name', {
    method: 'patch',
    params: z.object({
        username: z.string().nonempty(),
        name: z.string().nonempty(),
    }),
    query: z.object({ mode: ModeSchema, revision: z.string().optional() }),
    body: IPublicationPatchRequestSchema,
    headers: z.object({}),
    permissionVerification: verifyPublicationPermission,
    permission: { level: IUserRole.Moderator },
    handler: async (req) => {
        const controller = new PublicationController(req.permissionData);
        return await controller.patch(req.body);
    },
});

/**
 * @version v1.0.0
 * @method POST
 * @url /api/publication/:username/:name/revise
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication/feds01/trinity/revise
 *
 * @description This endpoint is used to create a revision of a publication from a previous
 * publication. The endpoint accepts a new revision tag that should be unique from all of the
 * publications in the current stream. This will copy the information from the most recent
 * publication and then create a new one, set it to the current one and then perform some other
 * administrative tasks when revising the publication.
 */
registerRoute(router, '/:username/:name/revise', {
    method: 'post',
    params: z.object({ username: z.string(), name: z.string() }),
    body: z.object({ revision: z.string(), changelog: z.string() }),
    query: z.object({ mode: ModeSchema }),
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
            document: response.publication.id,
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
    permissionVerification: verifyPublicationPermission,
    permission: { level: IUserRole.Administrator },
    handler: async (req) => {
        const controller = new PublicationController(req.permissionData);
        return await controller.revise(req.body.revision, req.body.changelog);
    },
});

/**
 * @version v1.0.0
 * @method GET
 * @url /publication/:username/:name/tree/:path*
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication/feds01/zap/tree/blahblah
 *
 * @description This endpoint is used to get all of the files for a publication
 * specified by the owner's name, the name of the publication and which revision of the publication
 * to index.
 */
registerRoute(router, '/:username/:name/tree/:path(*)', {
    method: 'get',
    params: z.object({
        username: z.string(),
        name: z.string(),
        path: z.string().optional(),
    }),
    query: z.object({
        mode: ModeSchema,
        sortBy: ResourceSortSchema,
        noContent: FlagSchema.default('false'),
        revision: z.string().optional(),
    }),
    headers: z.object({}),
    permissionVerification: verifyPublicationPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const controller = new PublicationController(req.permissionData);
        return await controller.getPathFromArchive(
            req.params.path ?? '',
            req.query.sortBy,
            req.query.noContent,
        );
    },
});

/**
 * @version v1.0.0
 * @method GET
 * @url /publication/:username/:name/download/:path*
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication/feds01/zap/download/blahblah
 *
 * @description This endpoint is used to download a raw file as a binary blob.
 */
registerRoute(router, '/:username/:name/download/:path(*)', {
    method: 'get',
    params: z.object({
        username: z.string(),
        name: z.string(),
        path: z.string().optional(),
    }),
    query: z.object({
        mode: ModeSchema,
        revision: z.string().optional(),
    }),
    headers: z.object({}),
    permissionVerification: undefined,
    permission: null,
    handler: async (req) => {
        const { revision } = req.query;

        const owner = await userUtils.transformUsernameIntoId(req);
        const publication = await Publication.findOne({
            owner: owner._id.toString(),
            name: req.params.name.toLowerCase(),
            ...(typeof revision !== 'undefined' ? { revision } : { current: true }),
        })
            .populate<{ owner: IUser }>('owner')
            .exec();

        if (!publication) {
            return { status: 'error', message: errors.RESOURCE_NOT_FOUND, code: 404 };
        }

        const controller = new PublicationController(publication);
        return await controller.getPathRawContent(req.params.path ?? '');
    },
});

/**
 * @version v1.0.0
 * @method POST
 * @url /api/publication/:username/:name/export
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication/feds01/zip/export
 *
 * @description This endpoint is used to initiate the exporting process for a publication. The endpoint
 * takes to required parameters which specify to where the publication should be exported and
 * if the export should also export reviews with the publication.
 */
registerRoute(router, '/:username/:name/export', {
    method: 'post',
    params: z.object({
        username: z.string().nonempty(),
        name: z.string().nonempty(),
    }),
    headers: z.object({}),
    body: z.object({}),
    query: z.object({
        mode: ModeSchema,
        to: z.string().url(),
        revision: z.string().optional(),
        exportReviews: FlagSchema,
    }),
    permissionVerification: verifyPublicationPermission,
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
 * @url /publication/:username/:name/sources
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication/feds01/zap/sources?revision=v1
 *
 * @description This endpoint is used to get all of the files for a publication
 * specified by the owner's name, the name of the publication and which revision of the publication
 * to index.
 */
registerRoute(router, '/:username/:name/sources', {
    method: 'get',
    params: z.object({
        username: z.string(),
        name: z.string(),
    }),
    headers: z.object({}),
    query: z.object({ mode: ModeSchema, revision: z.string() }),
    permissionVerification: verifyPublicationPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const controller = new PublicationController(req.permissionData);
        return await controller.sources();
    },
});

export default router;
