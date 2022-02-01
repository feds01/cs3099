import { z } from 'zod';
import express from 'express';
import User from '../../models/User';
import Logger from '../../common/logger';
import { moveResource } from '../../lib/fs';
import * as errors from '../../common/errors';
import registerRoute from '../../lib/requests';
import { archiveIndexToPath } from '../../lib/zip';
import Publication from '../../models/Publication';
import { convertSgId } from '../../transformers/sg';
import { SgMetadataSchema } from '../../validators/sg';
import { ObjectIdSchema } from '../../validators/requests';
import { downloadOctetStream, makeRequest } from '../../utils/fetch';

const router = express.Router();

/**
 *
 */
registerRoute(router, '/import', {
    method: 'post',
    params: z.object({}),
    body: z.object({}),
    query: z.object({ from: z.string().url(), id: z.string(), token: z.string() }),
    permission: null,
    handler: async (req, res) => {
        const { from, token, id } = req.query;

        // we'll send off these headers with both requests...
        const headers = { Authorization: `Bearer ${token}` };

        // Here we essentially need to make a request to the publication zip file and
        // the metadata endpoint
        const publication = await downloadOctetStream(from, `/api/sg/export/publication/${id}`, {
            headers,
        });

        if (publication.status === 'error') {
            return res.status(400).json({
                status: 'error',
                message: `request failed due to: ${publication.type}`,
                ...(typeof publication.errors !== 'undefined' && { extra: publication.errors }),
            });
        }

        // TODO: Here we currently ignore the metadata due to the complexities of migrating them.
        const metadata = await makeRequest(
            from,
            `/api/sg/export/publication/${id}/metadata`,
            SgMetadataSchema,
            { headers },
        );

        if (metadata.status === 'error') {
            return res.status(400).json({
                status: 'error',
                message: `request failed due to: ${metadata}`,
                ...(typeof metadata.errors !== 'undefined' && { extra: metadata.errors }),
            });
        }

        // So here's where it gets pretty complicated. We need to check if the publication
        // owner which is a global id exists in our external id. If it does, then we can just
        // use that owner as the owner of the publication we're about to create. Otherwise, we
        // will have to make the user in addition to making the publication.
        const externalId = convertSgId(metadata.data.publication.owner);
        const user = await User.findOne({ externalId }).exec();

        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: "Attempt to import publication onto user that doesn't exist.",
            });
        }

        const doc = new Publication({ ...metadata.data.publication, owner: user.id });

        try {
            await doc.save();

            // now we need to move the file to it's home location...
            const finalPath = archiveIndexToPath({
                userId: doc.owner.toString(),
                name: doc.name,
            });

            await moveResource(publication.data, finalPath);

            return res.status(200).json({
                status: 'ok',
                message: 'Successfully imported publication',
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

/**
 *
 */
registerRoute(router, '/export/:id/metadata', {
    method: 'get',
    params: z.object({ id: ObjectIdSchema }),
    query: z.object({ from: z.string().url(), state: z.string() }),
    permission: null,
    handler: async (req, res) => {
        const publication = await Publication.findById(req.params.id);

        if (!publication) {
            return res.status(404).json({
                status: 'error',
                error: errors.NON_EXISTENT_PUBLICATION_ID,
            });
        }

        return res.status(200).json({
            publication,
            reviews: [], // TODO: export publications too
        });
    },
});

/**
 *
 */
registerRoute(router, '/export/:id', {
    method: 'get',
    params: z.object({ id: ObjectIdSchema }),
    query: z.object({ from: z.string().url(), state: z.string() }),
    permission: null,
    handler: async (req, res) => {
        const publication = await Publication.findById(req.params.id);

        if (!publication) {
            return res.status(404).json({
                status: 'error',
                error: errors.NON_EXISTENT_PUBLICATION_ID,
            });
        }

        const { owner, name, revision } = publication;
        const archive = archiveIndexToPath({ userId: owner.toString(), name, revision });

        return res.status(200).sendFile(archive);
    },
});

export default router;
