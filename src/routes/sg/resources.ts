import assert from 'assert';
import express from 'express';
import { z } from 'zod';

import * as errors from '../../common/errors';
import * as zip from '../../lib/resources/zip';
import Logger from '../../common/logger';
import { verifyToken } from '../../lib/auth/auth';
import { downloadOctetStream, makeRequest } from '../../lib/communication/fetch';
import registerRoute from '../../lib/communication/requests';
import { ReviewImportIssues, ReviewImportManager } from '../../lib/import/review';
import { importUser } from '../../lib/import/user';
import { moveResource } from '../../lib/resources/fs';
import Publication, { IPublication } from '../../models/Publication';
import Review, { IReviewStatus, PopulatedReview } from '../../models/Review';
import { IUser } from '../../models/User';
import { config } from '../../server';
import { expr } from '../../utils/expr';
import { IAuthHeaderSchema } from '../../validators/auth';
import { ExportPublicationOptionsSchema } from '../../validators/export';
import { ObjectIdSchema } from '../../validators/requests';
import { SgMetadataSchema } from '../../validators/sg';

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
    headers: z.object({}),
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
                errors: publicationArchive.errors,
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

        // If we actually had to import the user from elsewhere, we will need to save it.
        if (userImport.toSave) {
            await userImport.doc.save();
        }
        assert(typeof userImport.doc._id !== 'undefined');
        const ownerId = userImport.doc._id.toString();

        // We have to check that the publication with 'name' and the 'ownerId' doesn't already
        // exist, otherwise this doesn't conform to our uniqueness constraints...
        const uniquenessCheck = await Publication.findOne({
            owner: ownerId,
            name: publication.name,
        }).exec();

        if (uniquenessCheck !== null) {
            return {
                status: 'error',
                code: 400,
                message: 'Publication already exists for the owner',
                errors: {
                    'publication.name': {
                        message: 'Publication name must be unique for the owner',
                    },
                },
            };
        }

        const doc = await new Publication({
            ...publication,
            owner: ownerId,
        }).save();

        // now we need to move the file to it's home location...
        const index = {
            userId: doc.owner.toString(),
            name: doc.name,
        };

        const finalPath = zip.archiveIndexToPath(index);
        await moveResource(publicationArchive.response, finalPath);

        // we also need to create a archive so that we can validate the review
        const archive = zip.loadArchive(index);
        assert(archive !== null);

        // We create a map of all the issues that occurred when trying to import the specific review
        const importIssues = new Map<number, ReviewImportIssues>();

        for (const [index, review] of reviews.entries()) {
            const reviewManager = new ReviewImportManager(ownerId, doc, review, archive);
            const result = await reviewManager.save();

            if (result.status === 'error') {
                Logger.info(`Failed to import review owned by user ${review.owner}`);
                const { issues, message } = result;
                importIssues.set(index, { issues, message });
            }
        }

        if (importIssues.size !== 0) {
            const errors = new Map<string, { message: string | string[] }>();

            for (const [issueIndex, importIssue] of importIssues.entries()) {
                const errorPath = `reviews.${issueIndex}`;

                errors.set(errorPath, { message: importIssue.message });

                for (const [commentIndex, commentIssue] of Object.entries(importIssue.issues)) {
                    for (const [fieldName, issues] of Object.entries(commentIssue)) {
                        errors.set(`${errorPath}.comments.${commentIndex}.${fieldName}`, {
                            message: issues,
                        });
                    }
                }
            }

            return { status: 'partial', code: 207, errors: Object.fromEntries(errors) };
        } else {
            return { status: 'ok', code: 200 };
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
    headers: z.object({ Authorization: IAuthHeaderSchema }),
    query: z.object({ from: z.string().url(), state: z.string() }),
    permission: null,
    handler: async (req) => {
        // we need to verify the token in the headers is valid...
        const token = await verifyToken(req.headers.Authorization, config.jwtSecret);
        const exportOptions = ExportPublicationOptionsSchema.parse(token.data);

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
        const reviews = await expr(async () => {
            if (exportOptions.exportReviews) {
                return (await Review.find({
                    publication: publication.id,
                    status: IReviewStatus.Completed,
                })
                    .populate<{ publication: IPublication }>('publication')
                    .populate<{ owner: IUser }>('owner')
                    .exec()) as PopulatedReview[];
            } else {
                return [];
            }
        });

        return {
            status: 'ok',
            code: 200,
            data: {
                publication: await Publication.projectAsSg(publication),
                reviews: await Promise.all(reviews.map(Review.projectAsSg)),
            },
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
    headers: z.object({ Authorization: IAuthHeaderSchema }),
    query: z.object({ from: z.string().url(), state: z.string() }),
    permission: null,
    handler: async (req) => {
        // we need to verify the token in the headers is valid...
        const token = await verifyToken(req.headers.Authorization, config.jwtSecret);
        ExportPublicationOptionsSchema.parse(token.data);

        const publication = await Publication.findById(req.params.id);

        if (!publication) {
            return {
                status: 'error',
                code: 404,
                message: errors.RESOURCE_NOT_FOUND,
            };
        }

        const { owner, name, revision } = publication;
        const archive = zip.archiveIndexToPath({ userId: owner.toString(), name, revision });

        return {
            status: 'file',
            code: 200,
            file: archive,
        };
    },
});

export default router;
