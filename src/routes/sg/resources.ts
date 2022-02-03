import { z } from 'zod';
import express from 'express';
import User, { IUser } from '../../models/User';
import Review, { IReviewStatus } from '../../models/Review';
import Publication, { IPublication } from '../../models/Publication';

import { moveResource } from '../../lib/fs';
import registerRoute from '../../lib/requests';
import { archiveIndexToPath } from '../../lib/zip';
import { downloadOctetStream, makeRequest } from '../../utils/fetch';

import Logger from '../../common/logger';
import * as errors from '../../common/errors';
import { convertSgId } from '../../transformers/sg';

import { SgMetadataSchema } from '../../validators/sg';
import { ObjectIdSchema } from '../../validators/requests';

const router = express.Router();

/**
 * @version v1.0.0
 * @method POST
 * @url /api/sg/resources/import
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/sg/resources/import
 *
 *
 * @description This route is used to handle an import procedure from external services
 * sending over their information about a publication and the publication itself. It
 * will make two requests which download the archive of the application itself and then
 * the other request downloads all the metadata about the publication including any left
 * reviews or comments on the publication.
 *
 * @see https://app.swaggerhub.com/apis/feds01/supergroup-c_api/1.0.0#/resources/post_api_sg_resources_import
 * */
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
            headers: {...headers, 'Content-Type': 'application/zip'},
        });

        if (publication.status === 'error') {
            return res.status(400).json({
                status: 'error',
                message: `request failed due to: ${publication.type}`,
                error: publication.errors || {},
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
            Logger.warn("Service replied with error status when downloading metadata.")
            Logger.warn(JSON.stringify(metadata));
            return res.status(400).json({
                status: 'error',
                message: `request failed due to: ${metadata.type}`,
                error: metadata.errors || {},
            });
        }

        // So here's where it gets pretty complicated. We need to check if the publication
        // owner which is a global id exists in our external id. If it does, then we can just
        // use that owner as the owner of the publication we're about to create. Otherwise, we
        // will have to make the user in addition to making the publication.
        const externalId = convertSgId(metadata.data.data.publication.owner);
        const user = await User.findOne({ externalId }).exec();

        if (!user) {
            Logger.warn("Couldn't save the publication due to it being in an orphaned state.")
            return res.status(400).json({
                status: 'error',
                message: "Attempt to import publication onto user that doesn't exist.",
            });
        }

        const doc = new Publication({ ...metadata.data.data.publication, owner: user.id });

        try {
            await doc.save();

            // now we need to move the file to it's home location...
            const finalPath = archiveIndexToPath({
                userId: doc.owner.toString(),
                name: doc.name,
            });

            await moveResource(publication.data, finalPath);

            //@@TODO: We have to deal with reviews here...

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
 * @version v1.0.0
 * @method GET
 * @url /api/sg/resources/export/:id/metadata
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/sg/resources/export/61f9c5a7f90225c567f389fc/metadata
 *
 *
 * @description This endpoint is used to collect all the possible metadata surrounding a publication.
 * The endpoint will find the publication in question and project it into a 'SuperGroup' variant which
 * has some fields omitted/transformed. Additionally, it will select all reviews on the publication
 * that have been marked as 'Completed' and project the review with all the comments.
 *
 * @see https://app.swaggerhub.com/apis/feds01/supergroup-c_api/1.0.0#/resources/get_api_sg_resources_export__id__metadata
 * */
registerRoute(router, '/export/:id/metadata', {
    method: 'get',
    params: z.object({ id: ObjectIdSchema }),
    query: z.object({ from: z.string().url(), state: z.string() }),
    permission: null,
    handler: async (req, res) => {
        const publication = await Publication.findById(req.params.id).exec();

        if (!publication || publication.draft) {
            return res.status(404).json({
                status: 'error',
                error: errors.NON_EXISTENT_PUBLICATION_ID,
            });
        }

        const projectedPublication = await Publication.projectAsSg(publication);

        // Okay, let's find all the reviews that are related to the current revision
        // of the publication, for now we don't consider revisions of a publication
        // a concept at all because external groups don't know about our revision system.
        const reviews = await Review.find({
            publication: publication.id,
            status: IReviewStatus.Completed,
        })
            .populate<{ publication: IPublication }>('publication')
            .populate<{ owner: IUser }>('owner')
            .exec();

        const projectedReviews = await Promise.all(
            reviews.map(async (review) => {
                return await Review.projectAsSg(review);
            }),
        );

        return res.status(200).json({
            publication: projectedPublication,
            reviews: projectedReviews,
        });
    },
});

/**
 * @version v1.0.0
 * @method GET
 * @url /api/sg/resources/export/:id
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/sg/resources/export/61f9c5a7f90225c567f389fc
 *
 *
 * @description This endpoint is used to download the archive of the most current version of the
 * publication. The archive is sent as an octet stream that can be saved by the service on
 * the other side of the transaction.
 *
 * @see https://app.swaggerhub.com/apis/feds01/supergroup-c_api/1.0.0#/resources/get_api_sg_resources_export__id_
 * */
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
