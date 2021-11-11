import { z } from 'zod';
import express from 'express';
import Logger from '../../common/logger';
import * as zip from '../../lib/zip';
import * as errors from './../../common/errors';
import * as userUtils from './../../utils/users';
import registerRoute from '../../lib/requests';
import Review from '../../models/Review';
import User, { IUserRole } from '../../models/User';
import Publication from '../../models/Publication';
import { comparePermissions } from '../../lib/permissions';
import { ModeSchema, ResourceSortSchema } from '../../validators/requests';
import { IPublicationCreationSchema } from '../../validators/publications';

import searchRouter from './search';
import bookmarkRouter from './bookmarks';
import { IReviewCreationSchema } from '../../validators/reviews';

const router = express.Router();

// Register the follower & bookmark routes
router.use('/', searchRouter);
router.use('/', bookmarkRouter);

/**
 *
 */
registerRoute(router, '/:username/:name/:revision/all/', {
    method: 'get',
    params: z.object({
        username: z.string(),
        name: z.string(),
        revision: z.string(),
    }),
    query: z.object({ mode: ModeSchema, sortBy: ResourceSortSchema }),
    permission: IUserRole.Default,
    handler: async (_req, _res) => {},
});

/**
 *
 */
registerRoute(router, '/:username/:name/:revision?/tree/:path(*)', {
    method: 'get',
    params: z.object({
        username: z.string(),
        name: z.string(),
        path: z.string().optional(),
        revision: z.string().optional(),
    }),
    query: z.object({ mode: ModeSchema, sortBy: ResourceSortSchema }),
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        const { name, revision, path } = req.params;

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
 * @url /api/publications/
 * @example
 * https://af268.cs.st-andrews.ac.uk/publication/
 * >>> body:
 * {
 *   "revision": "v1",
 *   "title": "Test",
 *   "introduction": "Introduction here",
 *   "collaborators": ["user1", "user2"],
 *   "draft": true
 * }
 *
 * @description Route to create a new publication entry in the database.
 */
registerRoute(router, '/', {
    method: 'post',
    params: z.object({}),
    body: IPublicationCreationSchema,
    query: z.object({}),
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const { name, collaborators, revision } = req.body;
        const { id: owner } = req.requester;

        // Check if the publication is already in use...
        const existingPublication = await Publication.count({
            owner,
            name,
            revision,
        }).exec();

        if (existingPublication > 0) {
            return res.status(400).json({
                status: 'error',
                message: errors.PUBLICATION_FAILED,
                extra: errors.PUBLICATION_EXISTS,
            });
        }

        // Find all corresponding ids of each collaborators' username
        const collaboratorDocs = await User.find({ username: { $in: collaborators } }).exec();

        if (collaboratorDocs.length < collaborators.length) {
            const namesFound = collaboratorDocs.map((doc) => doc.username);
            const missingNames = collaborators.filter((name: string) => !namesFound.includes(name));

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
 *
 */
registerRoute(router, '/:username', {
    method: 'get',
    params: z.object({ username: z.string() }),
    query: z.object({ mode: ModeSchema, pinned: z.enum(['true', 'false']).optional() }),
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        const { pinned } = req.query;
        const isPinned = pinned === 'true';

        // @@TODO: we might want to include revisions in the future with some options.
        const result = await Publication.find({
            owner: user.id,
            ...(typeof pinned !== 'undefined' && {
                $or: [...(!isPinned ? [{ pinned: { $exists: false } }] : []), { pinned: isPinned }],
            }),
            current: true,
        })
            .limit(50)
            .exec();

        // project each publication and then return it
        const publications = result.map((link) =>
            Publication.projectWith(link as typeof result[number], user),
        );

        return res.status(200).json({
            status: true,
            data: publications,
        });
    },
});

/**
 *
 */
registerRoute(router, '/:username/:name/revisions', {
    method: 'get',
    params: z.object({ username: z.string() }),
    query: z.object({ mode: ModeSchema, pinned: z.enum(['true', 'false']).optional() }), // @@TODO: use a boolean schema here
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        const { pinned } = req.query;
        const isPinned = pinned === 'true';

        // @@TODO: we might want to include revisions in the future with some options.
        const result = await Publication.find({
            owner: user.id,
            ...(typeof pinned !== 'undefined' && {
                $or: [...(!isPinned ? [{ pinned: { $exists: false } }] : []), { pinned: isPinned }],
            }),
            current: true,
        })
            .limit(50)
            .exec();

        // project each publication and then return it
        const revisions = result.map((link) =>
            Publication.projectWith(link as typeof result[number], user),
        );

        return res.status(200).json({
            status: 'ok',
            data: {
                revisions,
            },
        });
    },
});

/**
 *
 */
registerRoute(router, '/:username/:name/:revision?', {
    method: 'get',
    params: z.object({
        username: z.string().nonempty(),
        name: z.string().nonempty(),
        revision: z.string().optional(),
    }),
    query: z.object({ mode: ModeSchema, draft: z.enum(['true', 'false']).optional() }),
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const requester = req.requester;
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        const { name, revision } = req.params;

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
            !comparePermissions(requester.role, IUserRole.Moderator)
        ) {
            return res.status(404).json({
                status: 'error',
                message: errors.NON_EXISTENT_PUBLICATION,
            });
        } else if (typeof req.query.draft !== 'undefined') {
            const draft = req.query.draft === 'true';

            // So now here we can allow explicit filtering by draft or not...
            if (publication.draft !== draft) {
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
            revision,
        };
        const archive = zip.loadArchive(archiveIndex);

        return res.status(200).json({
            status: 'ok',
            publication: await Publication.project(publication, archive !== null),
        });
    },
});

/**
 * @description endpoint to delete the entire series of publications revisions
 */
registerRoute(router, '/:username/:name/all', {
    method: 'delete',
    params: z.object({
        username: z.string().nonempty(),
        name: z.string().nonempty(),
    }),
    query: z.object({ mode: ModeSchema }),
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        const requester = req.requester;
        const { name } = req.params;
        const isOwner = user.id === req.requester.id;

        if (isOwner || comparePermissions(requester.role, IUserRole.Moderator)) {
            const publications = await Publication.deleteMany({
                owner: user.id,
                name: name.toLowerCase(),
            }).exec();

            if (publications.deletedCount > 0) {
                return res.status(200).json({
                    status: 'ok',
                    message: 'Successfully deleted all revision of publications.',
                });
            }
        }

        return res.status(404).json({
            status: 'error',
            message: errors.NON_EXISTENT_PUBLICATION,
        });
    },
});

/**
 *
 */
registerRoute(router, '/:username/:name/:revision?', {
    method: 'delete',
    params: z.object({
        username: z.string().nonempty(),
        name: z.string().nonempty(),
        revision: z.string().optional(),
    }),
    query: z.object({ mode: ModeSchema, draft: z.enum(['true', 'false']).default('false') }),
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        const requester = req.requester;
        const { name, revision } = req.params;
        const draft = req.query.draft === 'true';
        const isOwner = user.id === req.requester.id;

        if (isOwner || comparePermissions(requester.role, IUserRole.Moderator)) {
            const publication = await Publication.findOneAndDelete({
                owner: user.id,
                name: name.toLowerCase(),
                draft,
                ...(typeof revision !== 'undefined' && { revision }),
            })
                .sort({ _id: -1 })
                .exec(); // get the most recent document

            if (publication) {
                return res.status(200).json({
                    status: 'ok',
                    message: 'Successfully deleted publication.',
                });
            }
        }

        return res.status(404).json({
            status: 'error',
            message: errors.NON_EXISTENT_PUBLICATION,
        });
    },
});

/**
 *
 */
registerRoute(router, '/:username/:name/:revision/export', {
    method: 'post',
    params: z.object({
        username: z.string().nonempty(),
        name: z.string().nonempty(),
        revision: z.string(),
    }),
    body: z.string({}),
    query: z.object({ mode: ModeSchema }),
    permission: IUserRole.Default,
    handler: async (_req, _res) => {},
});

/**
 *
 */
registerRoute(router, '/:name/:username/:revision/review', {
    method: 'post',
    body: IReviewCreationSchema,
    query: z.object({ mode: ModeSchema }),
    params: z.object({
        username: z.string().nonempty(),
        name: z.string().nonempty(),
        revision: z.string(),
    }),
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        const { name, revision } = req.params;

        // Verify that the publication exists...
        const publication = await Publication.findOne({
            owner: user.id,
            name: name.toLowerCase(),
            revision,
        })
            .sort({ _id: -1 })
            .exec();

        // Check that the publication isn't currently in draft mode...
        if (!publication || publication.draft) {
            return res.status(404).json({
                status: 'error',
                message: errors.NON_EXISTENT_PUBLICATION,
            });
        }

        // Now attempt to create the new review
        const newReview = new Review({
            publication: publication.id,
            owner: req.requester.id,
        });

        try {
            await newReview.save();

            return res.status(200).json({
                status: 'ok',
                message: 'Successfully initialised review.',
                review: Review.project(newReview),
            });
        } catch (e: unknown) {
            Logger.error(e);

            return res.status(500).json({
                status: 'error',
                message: errors.INTERNAL_SERVER_ERROR,
            });
        }
    },
});

export default router;
