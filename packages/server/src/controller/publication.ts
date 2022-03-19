import AdmZip from 'adm-zip';
import assert from 'assert';
import { z } from 'zod';

import * as errors from '../common/errors';
import * as zip from '../lib/resources/zip';
import Logger from '../common/logger';
import { createTokens } from '../lib/auth/auth';
import { makeRequest } from '../lib/communication/fetch';
import { ApiResponse } from '../lib/communication/response';
import { deleteResource, moveResource, resourceExists } from '../lib/resources/fs';
import { PublicationPathContent } from '../lib/resources/zip';
import Publication, { AugmentedPublicationDocument, IPublication } from '../models/Publication';
import Review, { AugmentedReviewDocument, IReview, IReviewStatus } from '../models/Review';
import { IUser } from '../models/User';
import { config } from '../server';
import { IUserPatchRequest } from '../validators/publications';
import { ResourceSortOrder } from '../validators/requests';

/** Response denoting the return of a publication object */
interface PublicationResponse {
    publication: Partial<AugmentedPublicationDocument>;
}

/** Response denoting the return of a publication archive entry */
interface PublicationArchiveEntryResponse {
    entry: PublicationPathContent;
}

/** Response denoting the return of a publication object entries */
interface PublicationArchiveResponse {
    entries: {
        type: 'file';
        updatedAt: number;
        contents: string;
        filename: string;
    }[];
}

/** Response returned when listing reviews on a publication */
interface ReviewList {
    reviews: Partial<AugmentedReviewDocument>[];
}

/** Data returned when creating a review */
interface CreateReview {
    review: Partial<IReview>;
}

export default class PublicationController {
    constructor(readonly publication: AugmentedPublicationDocument) {}

    /**
     * Helper method to verify that if a publication document wishes to modify a revision
     * field on itself or another document, that the revision tag is not taken.
     *
     * @param revision - The new tag that is to be used when amending a revision
     * @returns true if a publication has been found with the revision, false otherwise.
     */
    private async performRevisionCheck(revision: string): Promise<boolean> {
        // Verify that the provided revision number isn't attempting to use a 'revision' tag that's already used
        // by the current publication tree.
        const revisionCheck = await Publication.findOne({
            owner: this.publication.owner._id.toString(),
            name: this.publication.name,
            revision,
        });

        return revisionCheck !== null;
    }

    /**
     * Helper method to get the publication Archive object.
     *
     * @returns The corresponding archive object if any exists.
     */
    private async loadArchive(): Promise<AdmZip | null> {
        const archiveIndex = {
            userId: this.publication.owner._id.toString(),
            name: this.publication.name,
            ...(!this.publication.current && { revision: this.publication.revision }),
        };

        return zip.loadArchive(archiveIndex);
    }

    async delete(): Promise<ApiResponse<undefined>> {
        await this.publication.delete();

        const publicationPath = zip.archiveIndexToPath({
            userId: this.publication.owner._id.toString(),
            name: this.publication.name,
            ...(!this.publication.current && { revision: this.publication.revision }),
        });

        // we need to try to remove the folder that stores the publications...
        await deleteResource(publicationPath);

        // If the deleted publication is current, we need to essentially set the last publication in the
        // set of publications at the current one...
        if (this.publication.current) {
            const publications = await Publication.find({
                owner: this.publication.owner._id.toString(),
                name: this.publication.name,
            }).sort({ _id: -1 });

            // Update the most recent publication as the current one...
            if (publications.length > 0) {
                const newCurrentPublication = publications[0];
                assert(typeof newCurrentPublication !== 'undefined');

                await newCurrentPublication.updateOne({ current: true });

                // Move the resource of the publication from `<publication_name>/<revision>/publication.zip`
                // to `<publication_name>/publication.zip`
                const archiveIndex = {
                    userId: newCurrentPublication.owner._id.toString(),
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
    }

    /**
     * Method to patch a given publication document, whilst also performing any grunt work
     * required when patching the publication.
     *
     * @returns
     */
    async revise(revision: string, changelog: string): Promise<ApiResponse<PublicationResponse>> {
        if ((await this.performRevisionCheck(revision))) {
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
            ...this.publication.toObject(),
            _id: undefined,
            revision,
            changelog,
            draft: true,
        }).save();

        // we need to update the old publication to state that it is no longer the current one...
        await this.publication.updateOne({ $set: { current: false } });

        // Move the current publication file into it's corresponding revision folder within the
        // resources folder. We have to do this in the event that when the user uploads a new
        // version for the current revision, it's saved as 'publication.zip' because it becomes
        // the current sources version.
        const archiveIndex = {
            userId: this.publication.owner._id.toString(),
            name: this.publication.name,
        };

        const resourcePath = zip.archiveIndexToPath(archiveIndex);

        if (await resourceExists(resourcePath)) {
            await moveResource(
                resourcePath,
                zip.archiveIndexToPath({ ...archiveIndex, revision: this.publication.revision }),
            );
        }

        return {
            status: 'ok',
            code: 200,
            data: {
                publication: await Publication.project(newPublication, false),
            },
        };
    }

    /**
     * Method to patch a given publication document, whilst also performing any grunt work
     * required when patching the publication.
     *
     * @returns
     */
    async patch(patch: IUserPatchRequest): Promise<ApiResponse<PublicationResponse>> {
        // Verify that the provided revision number isn't attempting to use a 'revision' tag that's already used
        // by the current publication tree.
        if (typeof patch.revision !== 'undefined' && this.publication.revision !== patch.revision) {
            if ((await this.performRevisionCheck(patch.revision))) {
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
            this.publication._id.toString(),
            {
                $set: {
                    ...patch,
                    ...(typeof patch.collaborators !== 'undefined' && {
                        collaborators: [...patch.collaborators.values()],
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
    }

    /**
     * Function to get and project the publication in preparation for returning
     * a response.
     *
     * @returns
     */
    async get(): Promise<ApiResponse<PublicationResponse>> {
        // Check if the publication has an uploaded source file...
        const archive = await this.loadArchive();

        return {
            status: 'ok',
            code: 200,
            data: {
                publication: await Publication.project(this.publication, archive !== null),
            },
        };
    }

    async export(
        to: string,
        requesterId: string,
        exportReviews: boolean,
    ): Promise<ApiResponse<undefined>> {
        const { token } = createTokens(requesterId, { exportReviews });

        const result = await makeRequest(to, '/api/sg/resources/import', z.unknown(), {
            query: { from: config.frontendURI, token, id: this.publication._id.toString() },
            method: 'post',
        });

        if (result.status === 'error') {
            Logger.warn('Failed to export a publication:', result.errors);

            return {
                status: 'error',
                code: 400,
                message: `Failed to export review due to ${result.type}.`,
            };
        }

        return { status: 'ok', code: 200 };
    }

    /**
     * Method to get a resource by path from a publication archive.
     *
     * @param path - The string that represents a path within the ZIP archive.
     * @param sortBy - Order of which to sort publication entries by
     */
    async tree(
        path: string,
        sortBy: ResourceSortOrder,
    ): Promise<ApiResponse<PublicationArchiveEntryResponse>> {
        const archive = {
            userId: this.publication.owner._id.toString(),
            name: this.publication.name,
            ...(!this.publication.current && { revision: this.publication.revision }),
        };

        const entry = zip.getEntry(archive, path);

        if (!entry) {
            return {
                status: 'error',
                code: 404,
                message: errors.RESOURCE_NOT_FOUND,
            };
        }
        // Here we need to apply sorting to the particular entry if the entry is a directory type
        if (entry.type === 'directory') {
            const sortEntry = sortBy ?? 'directory';

            entry.entries = entry.entries.sort((a, b) => {
                const aType = a.type === sortEntry ? 1 : 0;
                const bType = b.type === sortEntry ? 1 : 0;

                const aText = a.filename;
                const bText = b.filename;

                // Sort here by alphabetical order if the types are the same
                if (aType !== bType) {
                    return aType > bType ? -1 : 1;
                }
                return aText < bText ? -1 : aText > bText ? 1 : 0;
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

    /**
     * Method to get a paginated list of sources for the publication using the
     * corresponding publication archive.
     *
     * @returns A list of entries that exist within the publication archive
     */
    async sources(): Promise<ApiResponse<PublicationArchiveResponse>> {
        const archive = await this.loadArchive();

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
    }

    /**
     * Method to list reviews on a publication
     *
     * @returns A list of reviews that exist on the specific publication
     */
    async reviews(): Promise<ApiResponse<ReviewList>> {
        const result = await Review.find({
            publication: this.publication._id.toString(),
            status: IReviewStatus.Completed,
        })
            .populate<{ publication: IPublication }>('publication')
            .populate<{ owner: IUser }>('owner')
            .exec();

        return {
            status: 'ok',
            code: 200,
            data: {
                reviews: await Promise.all(result.map(Review.project)),
            },
        };
    }

    /**
     * Method to create a review on a publication from the perspective of the
     * the requester.
     *
     * @param requesterId - User ID of the requester
     * @returns Response from creating a review.
     */
    async createReview(requesterId: string): Promise<ApiResponse<CreateReview>> {
        // Check that the publication isn't currently in draft mode...
        if (this.publication.draft) {
            return {
                status: 'error',
                code: 404,
                message: errors.RESOURCE_NOT_FOUND,
            };
        }

        const docParams = {
            publication: this.publication._id.toString(),
            owner: requesterId,
            status: IReviewStatus.Started,
        };

        const doc = await Review.findOne(docParams)
            .populate<{ publication: IPublication }>('publication')
            .populate<{ owner: IUser }>('owner')
            .exec();

        // If the user tries to creat ea new review whilst another pending review exists, that review
        // is returned instead of making a new review...
        if (doc) {
            Logger.info('Using pre-created review for user instead of creating a new one...');
            return {
                status: 'ok',
                code: 200,
                data: {
                    review: await Review.project(doc),
                },
            };
        }

        const newDoc = await new Review(docParams).save();

        const populated = await (
            await newDoc.populate<{ publication: IPublication }>('publication')
        ).populate<{ owner: IUser }>('owner');

        return {
            status: 'ok',
            code: 201,
            data: {
                review: await Review.project(populated),
            },
        };
    }
}
