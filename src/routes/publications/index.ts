import assert from 'assert';
import express from 'express';
import { z } from 'zod';

import * as zip from '../../lib/resources/zip';
import * as errors from './../../common/errors';
import * as userUtils from './../../utils/users';
import Logger from '../../common/logger';
import { createTokens } from '../../lib/auth/auth';
import { makeRequest } from '../../lib/communication/fetch';
import {
    compareUserRoles,
    verifyPublicationPermission,
    verifyPublicationWithElevatedPermission,
    verifyUserPermission,
} from '../../lib/communication/permissions';
import registerRoute from '../../lib/communication/requests';
import { deleteResource, moveResource, resourceExists } from '../../lib/resources/fs';
import Publication, { AugmentedPublicationDocument } from '../../models/Publication';
import { IUserRole } from '../../models/User';
import { config } from '../../server';
import { PaginationQuerySchema } from '../../validators/pagination';
import {
    IPublicationCreationSchema,
    IPublicationPatchRequestSchema,
} from '../../validators/publications';
import { FlagSchema, ModeSchema, ResourceSortSchema } from '../../validators/requests';
import reviewRouter from './reviews';

const router = express.Router();
router.use('/', reviewRouter);

/**
 * @version v1.0.0
 * @method GET
 * @url /publication/:username/:name/all/
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication/feds01/zap/all?revision=v1
 *
 * @description This endpoint is used to get all of the files for a publication
 * specified by the owner's name, the name of the publication and which revision of the publication
 * to index.
 */
registerRoute(router, '/:username/:name/all', {
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
        const user = await userUtils.transformUsernameIntoId(req);

        const { name } = req.params;
        const { revision } = req.query;

        const publication = await Publication.findOne({
            owner: user.id,
            name,
            revision,
        })
            .sort({ _id: -1 })
            .exec();

        if (!publication) {
            return {
                status: 'error',
                code: 404,
                message: errors.RESOURCE_NOT_FOUND,
            };
        }

        let archiveIndex = {
            userId: user.id!,
            name,
            ...(!publication.current && { revision }),
        };

        const archive = zip.loadArchive(archiveIndex);

        // @@Cleanup: we might have to return an error here if we can't find the archive, then
        //            it must of been deleted off the disk... which means we might have to invalidate
        //            the current revision?
        if (!archive) {
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
                entries: archive
                    .getEntries()
                    .filter((entry) => !entry.isDirectory)
                    .map((entry) => {
                        const contents = entry.getData();

                        return {
                            type: 'file',
                            updatedAt: entry.header.time.getTime(),
                            contents: contents.toString(),
                            filename: entry.entryName,
                        };
                    }),
            },
        };
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
        revision: z.string().optional(),
    }),
    headers: z.object({}),
    permissionVerification: verifyPublicationPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const user = await userUtils.transformUsernameIntoId(req);

        const { name, path } = req.params;
        const { revision } = req.query;

        const publication = await Publication.findOne({
            owner: user.id,
            name,
            ...(typeof revision !== 'undefined' && { revision }),
        })
            .sort({ _id: -1 })
            .exec();

        if (!publication) {
            return {
                status: 'error',
                code: 404,
                message: errors.RESOURCE_NOT_FOUND,
            };
        }

        let archive = {
            userId: user.id!,
            name,
            ...(!publication.current && typeof revision !== 'undefined' && { revision }),
        };

        const entry = zip.getEntry(archive, path ?? '');

        if (!entry) {
            return {
                status: 'error',
                code: 404,
                message: errors.RESOURCE_NOT_FOUND,
            };
        } else {
            // Here we need to apply sorting to the particular entry if the entry is a directory type
            if (entry.type === 'directory') {
                const sortBy = req.query.sortBy ?? 'directory';

                entry.entries = entry.entries.sort((a, b) => {
                    const aType = a.type === sortBy ? 1 : 0;
                    const bType = b.type === sortBy ? 1 : 0;

                    const aText = a.filename;
                    const bText = b.filename;

                    // Sort here by alphabetical order if the types are the same
                    if (aType !== bType) {
                        return aType > bType ? -1 : 1;
                    } else {
                        return aText < bText ? -1 : aText > bText ? 1 : 0;
                    }
                });
            }

            return {
                status: 'ok',
                code: 200,
                data: {
                    entry,
                },
            };
        }
    },
});

/**
 * @version v1.0.0
 * @method POST
 * @url /api/publication
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication/
 * >>> body:
 * {
 *   "revision": "v1",
 *   "title": "Test",
 *   "introduction": "Introduction here",
 *   "collaborators": ["user1", "user2"],
 * }
 *
 * @description Route to create a new publication entry in the database. The route
 * will prevent a creation of publications with the same name as ones that already
 * exist under the current user.
 */
registerRoute(router, '/', {
    method: 'post',
    params: z.object({}),
    body: IPublicationCreationSchema,
    query: z.object({}),
    headers: z.object({}),
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const { name, collaborators } = req.body;
        const { id: owner } = req.requester;

        // Check if the publication is already in use...
        const existingPublication = await Publication.count({
            owner,
            name,
        }).exec();

        if (existingPublication > 0) {
            return {
                status: 'error',
                code: 400,
                message: 'Publication with the same name already exists',
            };
        }

        // @@Hack: Basically we have to verify again that the set has no null items since
        //         TypeScript can't be entirely sure if there are no nulls in the set.
        //         This is also partly due to the fact that zod cant't combine .transform()
        //         and .refine() functions yet...
        const publication = await new Publication({
            ...req.body,
            draft: true,
            current: true,
            collaborators: [...collaborators.values()].filter((c) => c !== null),
            owner,
        }).save();

        return {
            status: 'ok',
            code: 201,
            data: {
                publication: await Publication.projectWith(publication, req.requester),
            },
        };
    },
});

/**
 * @version v1.0.0
 * @method GET
 * @url /api/publication
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication/
 *
 * @description Route to list the most publications in a paginated form
 */
registerRoute(router, '/', {
    method: 'get',
    params: z.object({}),
    query: PaginationQuerySchema,
    headers: z.object({}),
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const { skip, take } = req.query;

        type PublicationAggregation = {
            data: AugmentedPublicationDocument[];
            total?: number;
        };

        const aggregation = (await Publication.aggregate([
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
        .object({ mode: ModeSchema, pinned: FlagSchema.optional() })
        .merge(PaginationQuerySchema),
    headers: z.object({}),
    permissionVerification: verifyUserPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const user = await userUtils.transformUsernameIntoId(req);

        const { pinned, skip, take } = req.query;

        const result = await Publication.find({
            owner: user.id,
            ...(typeof pinned !== 'undefined' && {
                $or: [...(!pinned ? [{ pinned: { $exists: false } }] : []), { pinned }],
            }),
            current: true,
        })
            .skip(skip)
            .limit(take)
            .exec();

        return {
            status: 'ok',
            code: 200,
            data: {
                publications: await Promise.all(
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
 * @method GET
 * @url /api/publication/:username/:name/revisions
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication/507f1f77bcf86cd799439011
 *
 * @description This endpoint is used to get all of the revisions for a given publication.
 */
registerRoute(router, '/:username/:name/revisions', {
    method: 'get',
    params: z.object({ username: z.string(), name: z.string() }),
    query: z.object({ mode: ModeSchema }).merge(PaginationQuerySchema),
    headers: z.object({}),
    permissionVerification: verifyPublicationPermission,
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
        draft: FlagSchema.optional(),
        revision: z.string().optional(),
    }),
    headers: z.object({}),
    permissionVerification: verifyPublicationPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const user = await userUtils.transformUsernameIntoId(req);

        const name = req.params.name.toLowerCase();
        const { revision, draft } = req.query;

        const publication = await Publication.findOne({
            owner: user.id,
            name,
            ...(typeof draft !== 'undefined' && { draft }),
            ...(typeof revision !== 'undefined' ? { revision } : { current: true }),
        }).exec();

        if (!publication) {
            return {
                status: 'error',
                code: 404,
                message: errors.RESOURCE_NOT_FOUND,
            };
        }

        // So we don't need to actually specify the draft flag to the query
        // if the owner of the publication is a draft. However, if the callee
        // is not the owner of the current publication and doesn't have moderator
        // privileges, they can't get the publication. Only the owner should be able
        // to retrieve their draft. This behaviour is entirely overridden if the query
        // flag 'draft' is specified.
        const isOwner = publication.owner._id.toString() === req.requester.id;

        if (
            publication.draft &&
            !isOwner &&
            !compareUserRoles(req.requester.role, IUserRole.Moderator)
        ) {
            return {
                status: 'error',
                code: 404,
                message: errors.RESOURCE_NOT_FOUND,
            };
        }

        // Check if the publication has an uploaded source file...
        const archiveIndex = {
            userId: publication.owner._id.toString(),
            name: publication.name,
            revision: publication.current ? undefined : revision,
        };
        const archive = zip.loadArchive(archiveIndex);

        return {
            status: 'ok',
            code: 200,
            data: {
                publication: await Publication.project(publication, archive !== null),
            },
        };
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
    permissionVerification: verifyPublicationPermission,
    permission: { level: IUserRole.Administrator },
    handler: async (req) => {
        const user = await userUtils.transformUsernameIntoId(req);

        // Fetch the current publication
        const currentPublication = await Publication.findOne({
            owner: user.id,
            name: req.params.name,
            current: true,
        }).exec();

        if (!currentPublication) {
            return {
                status: 'error',
                code: 404,
                message: errors.RESOURCE_NOT_FOUND,
            };
        }

        // Verify that the provided revision number isn't attempting to use a 'revision' tag that's already used
        // by the current publication tree.
        const revisionCheck = await Publication.findOne({
            owner: user.id,
            name: req.params.name,
            revision: req.body.revision,
        });

        // We found a publication with the same owner, name and revision, meaning that we can't use this
        // revision tag because it's already in use.
        if (revisionCheck !== null) {
            return {
                status: 'error',
                code: 400,
                message: errors.BAD_REQUEST,
                errors: {
                    revision: {
                        message: 'Revision tag already in use',
                    },
                },
            };
        }

        const newPublication = await new Publication({
            ...currentPublication.toObject(),
            _id: undefined,
            ...req.body,
            draft: true,
        }).save();

        // we need to update the old publication to state that it is no longer the current one...
        await currentPublication.updateOne({ $set: { current: false } });

        // Move the current publication file into it's corresponding revision folder within the
        // resources folder. We have to do this in the event that when the user uploads a new
        // version for the current revision, it's saved as 'publication.zip' because it becomes
        // the current sources version.
        let archiveIndex = {
            userId: currentPublication.owner.toString(),
            name: currentPublication.name,
        };

        const resourcePath = zip.archiveIndexToPath(archiveIndex);

        if (await resourceExists(resourcePath)) {
            await moveResource(
                resourcePath,
                zip.archiveIndexToPath({ ...archiveIndex, revision: currentPublication.revision }),
            );
        }

        return {
            status: 'ok',
            code: 200,
            data: {
                publication: await Publication.project(newPublication, false),
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
    permissionVerification: verifyPublicationPermission,
    permission: { level: IUserRole.Administrator },
    handler: async (req) => {
        const user = await userUtils.transformUsernameIntoId(req);

        const { revision } = req.query;
        const name = req.params.name.toLowerCase();

        // Since we have cascading deletes, all the reviews on the publication are deleted as well.
        const publication = await Publication.findOneAndDelete({
            owner: user.id,
            name,
            ...(typeof revision !== 'undefined' ? { revision } : { current: true }),
        }).exec();

        if (!publication) {
            return {
                status: 'error',
                code: 404,
                message: errors.RESOURCE_NOT_FOUND,
            };
        }

        const publicationPath = zip.archiveIndexToPath({
            userId: publication.owner.toString(),
            name: publication.name,
            ...(!publication.current && { revision: publication.revision }),
        });

        // we need to try to remove the folder that stores the publications...
        await deleteResource(publicationPath);

        // If the deleted publication is current, we need to essentially set the last publication in the
        // set of publications at the current one...
        if (publication.current) {
            const publications = await Publication.find({ owner: user.id, name }).sort({ _id: -1 });

            // Update the most recent publication as the current one...
            if (publications.length > 0) {
                const newCurrentPublication = publications[0];
                assert(typeof newCurrentPublication !== 'undefined');

                await newCurrentPublication.updateOne({ current: true });

                // Move the resource of the publication from `<publication_name>/<revision>/publication.zip` to `<publication_name>/publication.zip`
                let archiveIndex = {
                    userId: newCurrentPublication.owner.toString(),
                    name: newCurrentPublication.name,
                };

                const oldResourcePath = zip.archiveIndexToPath({
                    ...archiveIndex,
                    revision: newCurrentPublication.revision,
                });

                // Check if it does exist, and if so move it to the 'new' one...
                if (await resourceExists(oldResourcePath)) {
                    await moveResource(oldResourcePath, zip.archiveIndexToPath(archiveIndex));
                }
            }
        }

        return { status: 'ok', code: 200 };
    },
});

/**
 * @version v1.0.0
 * @method PATCH
 * @url /api/publication/:username/:name
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication/507f1f77bcf86cd799439011
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
    permissionVerification: verifyPublicationWithElevatedPermission,
    permission: { level: IUserRole.Moderator, runPermissionFn: true },
    handler: async (req) => {
        const user = await userUtils.transformUsernameIntoId(req);

        const name = req.params.name.toLowerCase();
        const { revision } = req.query;

        const publication = await Publication.findOne({
            owner: user.id,
            name: name.toLowerCase(),
            ...(typeof revision !== 'undefined' && { revision }),
        }).exec();

        // If we couldn't find the publication, return a not found.
        if (!publication) {
            return {
                status: 'error',
                code: 404,
                message: errors.RESOURCE_NOT_FOUND,
            };
        }

        // Verify that the provided revision number isn't attempting to use a 'revision' tag that's already used
        // by the current publication tree.
        if (req.body.revision && publication.revision !== req.body.revision) {
            const revisionCheck = await Publication.findOne({
                owner: user.id,
                name: req.params.name,
                revision: req.body.revision,
            });

            // We found a publication with the same owner, name and revision, meaning that we can't use this
            // revision tag because it's already in use.
            if (revisionCheck !== null) {
                return {
                    status: 'error',
                    code: 400,
                    message: errors.BAD_REQUEST,
                    errors: {
                        revision: {
                            message: 'Revision tag already in use',
                        },
                    },
                };
            }
        }

        // So take the fields that are to be updated into the set request, it's okay to this because
        // we validated the request previously and we should be able to add all of the fields into the
        // database. If the user tries to update the username or an email that's already in use, mongo
        // will return an error because these fields have to be unique.
        const patchedPublication = await Publication.findByIdAndUpdate(
            publication.id,
            {
                $set: {
                    ...req.body,
                    ...(typeof req.body.collaborators !== 'undefined' && {
                        collaborators: [...req.body.collaborators?.values()],
                    }),
                },
            },
            { new: true },
        );
        assert(patchedPublication !== null);

        return {
            status: 'ok',
            code: 200,
            data: {
                publication: await Publication.project(patchedPublication, false),
            },
        };
    },
});

/**
 * @version v1.0.0
 * @method POST
 * @url /api/publication/:username/:name/export
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication/507f1f77bcf86cd799439011/export
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
        exportReviews: z.boolean(),
    }),
    permissionVerification: verifyPublicationPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const user = await userUtils.transformUsernameIntoId(req);

        // Get the publication
        const name = req.params.name.toLowerCase();
        const { revision } = req.query;

        const publication = await Publication.findOne({
            owner: user.id,
            name,
            ...(typeof revision !== 'undefined' ? { revision } : { current: true }),
        }).exec();

        if (!publication) {
            return {
                status: 'error',
                code: 404,
                message: errors.RESOURCE_NOT_FOUND,
            };
        }

        const { token } = createTokens(user.id, { exportReviews: req.query.exportReviews });

        const result = await makeRequest(req.query.to, '/api/sg/resources/import', z.any(), {
            query: { from: config.frontendURI, token, id: publication.id },
            method: 'post',
        });

        if (result.status === 'error') {
            Logger.warn(`Failed to export a review: ${result.errors}`);

            return {
                status: 'error',
                code: 400,
                message: `Failed to export review due to ${result.type}.`,
            };
        }

        return { status: 'ok', code: 200 };
    },
});

export default router;
