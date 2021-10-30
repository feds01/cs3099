import express from 'express';

import { z } from 'zod';
import User, { IUserRole } from '../../models/User';
import Logger from '../../common/logger';
import * as errors from '../../common/errors';
import Publication, { IPublicationDocument } from '../../models/Publications';
import {
    IPublicationPostRequestSchema,
    IPublicationPostRequest,
    SearchModeSchema,
} from '../../validators/publications';
import { registerRoute } from '../../wrappers/requests';
import { ExistUsernameSchema } from '../../validators/user';

const router = express.Router();

// Get all publications
registerRoute(router, '/', {
    method: 'get',
    params: z.object({}),
    query: z.object({}),
    permission: IUserRole.Default, 
    handler: async (_req, res) => {
        // TODO: pagination
        const publications = await Publication.find().limit(50);
        return res.status(200).json({
            status: true,
            publications: publications
        });
    },
});


// Get a list of all publications with a specific title or username
registerRoute(router, '/:keyword', {
    method: 'get',
    params: z.object({ keyword: z.string() }),
    query: z.object({ mode: SearchModeSchema }),
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const { mode } = req.query;
        const { keyword } = req.params;

        let publications: IPublicationDocument[];
        if (!mode || mode === 'title') {
            publications = await Publication.find({ title: keyword });
        } else {
            const userDoc = await User.findOne({ username: keyword}).exec();
            if (!userDoc) {
                return res.status(400).json({
                    status: false,
                    message: errors.BAD_REQUEST,
                });
            }
            
            publications = await Publication.find({ owner: userDoc.id });
        }

        if (!publications) {
            return res.status(404).json({
                status: false,
                message: errors.NON_EXISTENT_PUBLICATION,
            });
        }

        return res.status(200).json({
            status: true,
            publications,
        });
    }
});

/**
 * @version v1.0.0
 * @method POST
 * @url /api/publication/
 * @example
 * https://af268.cs.st-andrews.ac.uk/publication/
 * >>> body:
 * {
 *   "revision": "v1",
 *   "title": "Test",
 *   "introduction": "Introduction here",
 *   "collaborators": ["user1", "user2"],
 *   "attachment": "https://example.com/attachment"
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
        const { title, collaborators } = response;
        const { id: owner } = req.token.data;

        // Check if the title is already in use.
        const existingPublication = await Publication.count({ owner, title: title }).exec();
        if (existingPublication > 0) {
            return res.status(400).json({
                status: false,
                message: errors.PUBLICATION_FAILED,
                extra: errors.TITLE_EXISTS,
            });
        }

        // Find all corresponding ids of each collaborators' username
        const collaboratorDocs = await User.find({ username: { $in: collaborators }}).exec();
        if (collaboratorDocs.length < collaborators.length) {
            let namesFound: string[] = collaboratorDocs.map(doc => doc.username);
            let missingNames: string[] = collaborators.filter((name: string) => !namesFound.includes(name));
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
            attachment: response.attachment,
            collaborators: collaboratorDocs.map((doc) => doc.id),
            owner,
        });

        try {
            const savedPublication = await newPublication.save();

            return res.status(201).json({
                status: true,
                message: 'Successfully submitted new publication.',
                publication: savedPublication,
            })
        } catch (e) {
            Logger.error(e);

            return res.status(500).json({
                status: false,
                message: errors.INTERNAL_SERVER_ERROR,
            });
        }
    }
});

registerRoute(router, '/:username/:title', {
    method: 'get',
    params: z.object({ username: ExistUsernameSchema, title: z.string() }),
    query: z.object({}),
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const { username, title } = req.params;
        const userDoc = await User.findOne({ username });
        // username must exist after parsed by ExistUsernameSchema 
        const userId = userDoc?.id;
        const publication = await Publication.findOne({ owner: userId, title });
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
    }
});

export default router;
