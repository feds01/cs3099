import { z } from 'zod';
import express from 'express';
import Logger from '../../common/logger';
import * as zip from "./../../wrappers/zip";
import User, { IUserRole } from '../../models/User';
import * as errors from "./../../common/errors";
import * as userUtils from "./../../utils/users";
import registerRoute from '../../wrappers/requests';
import Publication from '../../models/Publication';
import { ModeSchema } from '../../validators/requests';
import {
    IPublicationCreationSchema,
} from '../../validators/publications';
import searchRouter from './search';

const router = express.Router();

// Register the follower routes
router.use('/', searchRouter);

registerRoute(router, '/:username/:title/:revision?/tree/:path(*)', {
    method: 'get',
    params: z.object({ username: z.string(), title: z.string(), path: z.string().optional(), revision: z.string().optional(), }),
    query: z.object({ mode: ModeSchema }),
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        const { title, revision, path } = req.params;

        // TODO: We need to check that the actual revision exists
        // TODO: We need to get the actual publication entry

        let archive = {
            userId: user.id!,
            name: title,
            ...(typeof revision !== 'undefined' && { revision })
        }

        const transformedPath = path ?? "/";
        const entry = zip.getEntry(archive, transformedPath === "" ? "/" : transformedPath);

        if (!entry) {
            return res.status(404).json({
                status: false,
                message: errors.RESOURCE_NOT_FOUND,
            })
        } else {
            return res.status(200).json({
                status: true,
                data: entry
            })
        }
    }
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
        const { name, collaborators, revision, draft } = req.body
        const { id: owner } = req.token.data;

        // Check if the publication is already in use...
        const existingPublication = await Publication.count({
            owner,
            name,
            revision,
            draft,
        }).exec();

        if (existingPublication > 0) {
            return res.status(400).json({
                status: false,
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
                status: false,
                message: errors.NON_EXISTENT_USER,
                extra: missingNames,
            });
        }

        const newPublication = new Publication({
            ...req.body,
            collaborators: collaboratorDocs.map((doc) => doc.id),
            owner,
        });

        try {
            const publication = await newPublication.save();

            return res.status(201).json({
                status: true,
                message: 'Successfully submitted new publication.',
                publication,
            });
        } catch (e) {
            Logger.error(e);

            return res.status(500).json({
                status: false,
                message: errors.INTERNAL_SERVER_ERROR,
            });
        }
    },
});

registerRoute(router, '/:username/:name/:revision?', {
    method: 'get',
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

        const draft = req.query.draft === 'true';
        const { name, revision } = req.params;

        // sort by id in descending order since this is actually faster than using a 'createdAt' field because 
        // ObjectID's in MongoDB have a natural ascending order of time. More information about the details
        // are here: https://stackoverflow.com/a/54741405
        const publication = await Publication.findOne({
            owner: user.id,
            name,
            draft,
            ...(typeof revision !== 'undefined' && { revision })
        }).sort({ _id: -1 }).exec();

        if (!publication) {
            return res.status(404).json({
                status: false,
                message: errors.NON_EXISTENT_PUBLICATION,
            });
        }

        return res.status(200).json({
            status: true,
            publication,
        });
    },
});

export default router;
