import { z } from 'zod';
import express from 'express';
import assert from 'assert';
import Logger from '../../common/logger';
import * as zip from '../../lib/zip';
import searchRouter from './search';
import reviewRouter from './reviews';
import { config } from '../../server';
import { createTokens } from '../../lib/auth';
import { deleteResource } from '../../lib/fs';
import { makeRequest } from '../../lib/fetch';
import * as errors from './../../common/errors';
import * as userUtils from './../../utils/users';
import registerRoute from '../../lib/requests';
import User, { IUserRole } from '../../models/User';
import Publication from '../../models/Publication';
import { FlagSchema, ModeSchema, ResourceSortSchema } from '../../validators/requests';
import {
    compareUserRoles,
    verifyPublicationPermission,
    verifyUserPermission,
} from '../../lib/permissions';
import {
    IPublicationCreationSchema,
    IPublicationPatchRequestSchema,
} from '../../validators/publications';

const router = express.Router();
router.use('/', searchRouter);
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
    query: z.object({ mode: ModeSchema, revision: z.string() }),
    permissionVerification: verifyPublicationPermission,
    permission: { level: IUserRole.Default },
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

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
            return res.status(404).json({
                status: 'error',
                message: errors.RESOURCE_NOT_FOUND,
            });
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
            return res.status(404).json({
                status: 'error',
                message: errors.RESOURCE_NOT_FOUND,
            });
        }

        return res.status(200).json({
            status: 'ok',
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
        });
    },
});

/**
 * @version v1.0.0
 * @method GET
 * @url /publication/:username/:name/:revision/all/
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
    permissionVerification: verifyPublicationPermission,
    permission: { level: IUserRole.Default },
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

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
            return res.status(404).json({
                status: 'error',
                message: errors.RESOURCE_NOT_FOUND,
            });
        }

        let archive = {
            userId: user.id!,
            name,
            ...(!publication.current && typeof revision !== 'undefined' && { revision }),
        };

        const transformedPath = path ?? '';
        let entry = zip.getEntry(archive, transformedPath);

        if (!entry) {
            return res.status(404).json({
                status: 'error',
                message: errors.RESOURCE_NOT_FOUND,
            });
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

            return res.status(200).json({
                status: 'ok',
                data: entry,
            });
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
 *   "draft": true
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
    permission: { level: IUserRole.Default },
    handler: async (req, res) => {
        const { name, collaborators } = req.body;
        const { id: owner } = req.requester;

        // Check if the publication is already in use...
        const existingPublication = await Publication.count({
            owner,
            name,
        }).exec();

        if (existingPublication > 0) {
            return res.status(400).json({
                status: 'error',
                message: errors.PUBLICATION_EXISTS,
            });
        }

        // Find all corresponding ids of each collaborators' username
        const collaboratorDocs = await User.find({ username: { $in: collaborators } }).exec();

        if (collaboratorDocs.length < collaborators.length) {
            const namesFound = collaboratorDocs.map((doc) => doc.username);
            const missingNames = collaborators.filter((name) => !namesFound.includes(name));

            return res.status(404).json({
                status: 'error',
                message: errors.NON_EXISTENT_USER,
                extra: missingNames,
            });
        }

        const newPublication = new Publication({
            ...req.body,
            draft: true,
            current: true,
            collaborators: collaboratorDocs.map((doc) => doc.id),
            owner,
        });

        try {
            const publication = await newPublication.save();

            return res.status(201).json({
                status: 'ok',
                message: 'Successfully submitted new publication.',
                publication: Publication.projectWith(publication, req.requester),
            });
        } catch (e) {
            Logger.error(e);

            return res.status(500).json({
                status: 'error',
                message: errors.INTERNAL_SERVER_ERROR,
            });
        }
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
    query: z.object({ mode: ModeSchema, pinned: FlagSchema.optional() }),
    permissionVerification: verifyUserPermission,
    permission: { level: IUserRole.Default },
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        const { pinned } = req.query;

        // @@TODO: we might want to include revisions in the future with some options.
        const result = await Publication.find({
            owner: user.id,
            ...(typeof pinned !== 'undefined' && {
                $or: [...(!pinned ? [{ pinned: { $exists: false } }] : []), { pinned }],
            }),
            current: true,
        })
            .limit(50)
            .exec();

        return res.status(200).json({
            status: 'ok',
            data: result.map((item) => Publication.projectWith(item, user)),
        });
    },
});

/**
 * @version v1.0.0
 * @method GET
 * @url /api/publication/:id/revisions
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication/507f1f77bcf86cd799439011
 *
 * @description This endpoint is used to get all of the revisions for a given publication.
 */
registerRoute(router, '/:username/:name/revisions', {
    method: 'get',
    params: z.object({ username: z.string(), name: z.string() }),
    query: z.object({ mode: ModeSchema }),
    permissionVerification: verifyPublicationPermission,
    permission: { level: IUserRole.Default },
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        const result = await Publication.find({
            owner: user.id,
            current: true,
        })
            .limit(50)
            .exec();

        return res.status(200).json({
            status: 'ok',
            revisions: result.map((item) => Publication.projectWith(item, user)),
        });
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
    permissionVerification: verifyPublicationPermission,
    permission: { level: IUserRole.Default },
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        const { name } = req.params;
        const { revision } = req.query;

        // sort by id in descending order since this is actually faster than using a 'createdAt' field because
        // ObjectID's in MongoDB have a natural ascending order of time. More information about the details
        // are here: https://stackoverflow.com/a/54741405
        const publication = await Publication.findOne({
            owner: user.id,
            name: name.toLowerCase(),
            ...(typeof revision !== 'undefined' && { revision }),
        })
            .sort({ _id: -1 })
            .exec();

        if (!publication) {
            return res.status(404).json({
                status: 'error',
                message: errors.NON_EXISTENT_PUBLICATION,
            });
        }

        // So we don't need to actually specify the draft flag to the query
        // if the owner of the publication is a draft. However, if the callee
        // not the owner of the current publication and doesn't have moderator
        // privileges, they can't get the publication. Only the owner should be able
        // to retrieve their draft. This behaviour is entirely overridden if the query
        // flag 'draft' is specified.
        const isOwner = publication.owner._id.toString() === req.requester.id;

        if (
            publication.draft &&
            !isOwner &&
            !compareUserRoles(req.requester.role, IUserRole.Moderator)
        ) {
            return res.status(404).json({
                status: 'error',
                message: errors.NON_EXISTENT_PUBLICATION,
            });
        } else if (typeof req.query.draft !== 'undefined') {
            // So now here we can allow explicit filtering by draft or not...
            if (publication.draft !== req.query.draft) {
                return res.status(404).json({
                    status: 'error',
                    message: errors.NON_EXISTENT_PUBLICATION,
                });
            }
        }

        // Check if the publication has an uploaded source file...
        const archiveIndex = {
            userId: publication.owner._id.toString(),
            name: publication.name,
            revision: publication.current ? undefined : revision,
        };
        const archive = zip.loadArchive(archiveIndex);

        return res.status(200).json({
            status: 'ok',
            publication: await Publication.project(publication, archive !== null),
        });
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
    permissionVerification: verifyPublicationPermission,
    permission: { level: IUserRole.Administrator },
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        const { name, username } = req.params;

        const owner = await User.findOne({ username }).exec();
        assert(owner !== null);

        await Publication.deleteMany({ owner: owner.id, name: name.toLowerCase() }).exec();

        try {
            const publicationPath = zip.resourceIndexToPath({
                type: 'publication',
                owner: owner.id,
                name: name,
            });

            // we need to try to remove the folder that stores the publications...
            await deleteResource(publicationPath);

            return res.status(200).json({ status: 'ok' });
        } catch (e: unknown) {
            Logger.error(e);

            return res.status(500).json({
                status: 'error',
                message: errors.INTERNAL_SERVER_ERROR,
            });
        }
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
        draft: FlagSchema.default('false'),
        revision: z.string().optional(),
    }),
    permissionVerification: verifyPublicationPermission,
    permission: { level: IUserRole.Administrator },
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        const { revision, draft } = req.query;
        const { name, username } = req.params;

        const owner = await User.findOne({ username }).exec();
        assert(owner !== null);

        const publication = await Publication.findOneAndDelete({
            owner: user.id,
            name: name.toLowerCase(),
            draft,
            ...(typeof revision !== 'undefined' && { revision }),
        })
            .sort({ _id: -1 })
            .exec(); // get the most recent document

        if (!publication) {
            return res.status(404).json({
                status: 'error',
                message: errors.NON_EXISTENT_PUBLICATION,
            });
        }

        try {
            const publicationPath = zip.resourceIndexToPath({
                type: 'publication',
                owner: owner.id.toString(),
                name,
                ...(typeof revision !== 'undefined' && { path: [revision, 'publication.zip'] }),
            });

            // we need to try to remove the folder that stores the publications...
            await deleteResource(publicationPath);

            return res.status(200).json({ status: 'ok' });
        } catch (e: unknown) {
            Logger.error(e);

            return res.status(500).json({
                status: 'error',
                message: errors.INTERNAL_SERVER_ERROR,
            });
        }
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
    permissionVerification: verifyPublicationPermission,
    permission: { level: IUserRole.Administrator },
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        const { name } = req.params;
        const { revision } = req.query;

        // So take the fields that are to be updated into the set request, it's okay to this because
        // we validated the request previously and we should be able to add all of the fields into the
        // database. If the user tries to update the username or an email that's already in use, mongo
        // will return an error because these fields have to be unique.
        let newPublication = await Publication.findOneAndUpdate(
            {
                owner: user.id,
                name: name.toLowerCase(),
                ...(typeof revision !== 'undefined' && { revision }),
            },
            { $set: { ...req.body } },
            { new: true },
        ).exec();

        // If we couldn't find the publication, return a not found.
        if (!newPublication) {
            return res.status(404).json({
                status: 'error',
                message: errors.NON_EXISTENT_PUBLICATION,
            });
        }

        return res.status(200).json({
            status: 'ok',
            publication: await Publication.project(newPublication, false),
        });
    },
});

/**
 * @version v1.0.0
 * @method POST
 * @url /api/publication/:id/export
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/publication/507f1f77bcf86cd799439011/export
 *
 * @description This endpoint is used to initiate the exporting process for a publication. The endpoint
 * takes to required parameters which specify to where the publication should be exported and
 * if the export should also export reviews with the publication.
 *
 * @@TODO: handle whether we export reviews or not in the form of providing permissions in the tokens
 *         that we send!
 */
registerRoute(router, '/:username/:name/export', {
    method: 'post',
    params: z.object({
        username: z.string().nonempty(),
        name: z.string().nonempty(),
    }),
    body: z.object({}),
    query: z.object({
        mode: ModeSchema,
        to: z.string().url(),
        revision: z.string().optional(),
        exportReviews: z.boolean(),
    }),
    permissionVerification: verifyPublicationPermission,
    permission: { level: IUserRole.Default },
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        // Get the publication
        const { name } = req.params;
        const { revision } = req.query;

        const publication = await Publication.findOne({
            owner: user.id,
            name: name.toLowerCase(),
            ...(typeof revision !== 'undefined' && { revision }),
        })
            .sort({ _id: -1 })
            .exec(); // get the most recent document

        if (!publication) {
            return res.status(404).json({
                status: 'error',
                message: errors.NON_EXISTENT_PUBLICATION,
            });
        }

        // @@ Hack: this should be done by some kind of token service...
        const { token } = createTokens({ username: user.username, id: user.id, email: user.email });

        const result = await makeRequest(req.query.to, '/api/sg/resources/import', z.any(), {
            query: { from: config.frontendURI, token, id: publication.id },
            method: 'post',
        });

        if (result.status === 'error') {
            Logger.warn(`Failed to export a review: ${result.errors}`);

            return res.status(400).json({
                status: 'error',
                message: `Failed to export review due to ${result.type}.`,
            });
        }

        return res.status(200).json({
            status: 'ok',
        });
    },
});

export default router;
