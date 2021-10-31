import express from 'express';

import { z } from 'zod';
import User, { IUserRole } from '../../models/User';
import Logger from '../../common/logger';
import * as errors from '../../common/errors';
import Publication from '../../models/Publications';
import {
    IPublicationPostRequestSchema,
    IPublicationPostRequest,
} from '../../validators/publications';
import { registerRoute } from '../../wrappers/requests';
import * as userUtils from '../../utils/users';
import { ModeSchema } from '../../validators/requests';
import searchRouter from './search';

const router = express.Router();

// Register the follower routes
router.use('/', searchRouter);

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
 */
registerRoute(router, '/', {
    method: 'post',
    params: z.object({}),
    body: IPublicationPostRequestSchema,
    query: z.object({}),
    permission: IUserRole.Default,
    handler: async (req, res) => {
        let response: IPublicationPostRequest = req.body;
        const { title, collaborators, revision, draft } = response;
        const { id: owner } = req.token.data;

        // Check if the publication is already in use.
        const existingPublication = await Publication.count({
            owner,
            title,
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
            revision: response.revision,
            title: response.title,
            introduction: response.introduction,
            collaborators: collaboratorDocs.map((doc) => doc.id),
            draft: response.draft,
            owner,
        });

        try {
            const savedPublication = await newPublication.save();

            return res.status(201).json({
                status: true,
                message: 'Successfully submitted new publication.',
                publication: savedPublication,
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

registerRoute(router, '/:username/:title/:revision?', {
    method: 'get',
    params: z.object({
        username: z.string().nonempty(),
        title: z.string().nonempty(),
        revision: z.string().optional(),
    }),
    query: z.object({ mode: ModeSchema, draft: z.enum(['true', 'false']).default('false') }),
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const userDoc = await userUtils.transformUsernameIntoId(req, res);
        if (!userDoc) return;

        const draft = req.query.draft === 'true';
        const { title, revision } = req.params;

        let doc;
        if (!revision) {
            // get the most recently created publication
            doc = await Publication.findOne({ owner: userDoc.id, title, draft })
                .sort({ _id: -1 }) // sort by id in descending order
                .exec();
        } else {
            doc = await Publication.findOne({ owner: userDoc.id, title, draft, revision });
        }
        const publication = doc;
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
