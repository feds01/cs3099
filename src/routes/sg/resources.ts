import { z } from 'zod';
import express from 'express';
import { IUser } from '../../models/User';
import Review, { IReviewStatus } from '../../models/Review';
import Publication, { IPublication } from '../../models/Publication';

import { moveResource } from '../../lib/fs';
import { importUser } from '../../lib/import';
import registerRoute from '../../lib/requests';
import { archiveIndexToPath } from '../../lib/zip';
import { downloadOctetStream, makeRequest } from '../../lib/fetch';

import Logger from '../../common/logger';
import * as errors from '../../common/errors';

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
    handler: async (req) => {
        const { from, token, id } = req.query;

        // we'll send off these headers with both requests...
        const headers = { Authorization: `Bearer ${token}` };

        // Here we essentially need to make a request to the publication zip file and
        // the metadata endpoint
        const publicationArchive = await downloadOctetStream(
            from,
            `/api/sg/export/publication/${id}`,
            {
                headers: { ...headers, 'Content-Type': 'application/zip' },
            },
        );

        if (publicationArchive.status === 'error') {
            return {
                status: 'error',
                code: 400,
                message: `request failed due to: ${publicationArchive.type}`,
                errors: publicationArchive.errors
            };
        }

        // Attempt to fetch the metadata of the review
        const metadata = await makeRequest(
            from,
            `/api/sg/export/publication/${id}/metadata`,
            SgMetadataSchema,
            { headers },
        );

        if (metadata.status === 'error') {
            Logger.warn(
                `Service replied with error status when downloading metadata:\n${JSON.stringify(
                    metadata.errors,
                )}`,
            );
            return {
                status: 'error',
                code: 400,
                message: `request failed due to: ${metadata.type}`,
                errors: metadata.errors,
            };
        }

        const { publication, reviews } = metadata.response.data;

        // So here's where it gets pretty complicated. We need to check if the publication
        // owner which is a global id exists in our external id. If it does, then we can just
        // use that owner as the owner of the publication we're about to create. Otherwise, we
        // will have to make the user in addition to making the publication.
        const userImport = await importUser(publication.owner);

        if (userImport.status === 'error') {
            return {
                code: 400,
                ...userImport,
            };
        }


        const doc = await new Publication({
            ...publication,
            owner: userImport.item.id.toString(),
        }).save();

        // now we need to move the file to it's home location...
        const finalPath = archiveIndexToPath({
            userId: doc.owner.toString(),
            name: doc.name,
        });

        await moveResource(publicationArchive.response, finalPath);

        //@@TODO: We have to deal with reviews here...
        // const reviewImportErrors = []
        for (const review of reviews) {
            Logger.info(`Attempting to import user ${review.owner} for review`);
        }

        return { status: 'ok', code: 200 };
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
    handler: async (req) => {
        const publication = await Publication.findById(req.params.id).exec();

        if (!publication || publication.draft) {
            return {
                status: 'error',
                code: 404,
                message: errors.RESOURCE_NOT_FOUND,
            };
        }

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

        return {
            status: 'ok',
            code: 200,
            data: {
                publication: await Publication.projectAsSg(publication),
                reviews: await Promise.all(reviews.map(Review.projectAsSg)),
            }
        };
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
    handler: async (req) => {
        const publication = await Publication.findById(req.params.id);

        if (!publication) {
            return {
                status: 'error',
                code: 404,
                message: errors.RESOURCE_NOT_FOUND,
            };
        }

        const { owner, name, revision } = publication;
        const archive = archiveIndexToPath({ userId: owner.toString(), name, revision });

        return {
            status: "file",
            code: 200,
            file: archive
        };
    },
});

export default router;
