import assert from 'assert';
import express from 'express';
import { z } from 'zod';

import * as errors from '../../common/errors';
import * as fs from '../../lib/resources/fs';
import * as zip from '../../lib/resources/zip';
import Logger from '../../common/logger';
import {
    verifyPublicationIdPermission,
    verifyReviewPermission,
    verifyUserPermission,
} from '../../lib/communication/permissions';
import registerRoute from '../../lib/communication/requests';
import Activity, { IActivityType } from '../../models/Activity';
import Publication from '../../models/Publication';
import User, { IUserRole } from '../../models/User';
import { config } from '../../server';
import { ResponseErrorSummary } from '../../transformers/error';
import { extractFile, joinPathsForResource, joinPathsRaw } from '../../utils/resources';
import { ModeSchema, ObjectIdSchema } from '../../validators/requests';

const router = express.Router();

/**
 * @version v1.0.0
 * @method POST
 *
 * @url /api/resources/upload/:username
 * @example
 * https://af268.cs.st-andrews.ac.uk/api/resources/upload/feds01
 *
 * @description Endpoint for uploading avatar to the server.
 */
registerRoute(router, '/upload/:username', {
    params: z.object({ username: z.string() }),
    query: z.object({ mode: ModeSchema }),
    body: z.any(),
    headers: z.object({}),
    method: 'post',
    permission: { level: IUserRole.Moderator },
    permissionVerification: verifyUserPermission,
    handler: async (req) => {
        const file = extractFile(req.raw);
        const user = req.permissionData;

        if (!file) {
            return {
                status: 'error',
                code: 400,
                message: errors.BAD_REQUEST,
            };
        }

        // check here that the correct mime type is set on the file, for now we
        // only accept jpg/png images...
        if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg') {
            return {
                status: 'error',
                code: 400,
                message: errors.BAD_REQUEST,
                errors: {
                    file: {
                        message:
                            "Invalid file mimetype sent. Image upload only accepts 'png' or 'jpeg'.",
                    },
                },
            };
        }

        // check file size is no bigger than 300kb
        if (file.size > 1024 * 300) {
            throw new errors.ApiError(413, 'The file size is too large, limit is 300Kb.', {
                file: {
                    message: 'File size too large. Must be less than 300Kb',
                    code: errors.CODES.RESOURCE_UPLOAD_TOO_LARGE,
                },
            });
        }

        const uploadPath = joinPathsForResource('avatar', user._id.toString(), 'avatar');

        // Move the file into it's appropriate storage location
        await file.mv(uploadPath);

        // Set the profile pictureUrl of the user with the current endpoint
        const updatedUser = await User.findByIdAndUpdate(
            user._id.toString(),
            {
                $set: {
                    profilePictureUrl: `${
                        config.serviceEndpoint
                    }/user/${user._id.toString()}/avatar?mode=id`,
                },
            },
            { new: true },
        ).exec();
        assert(updatedUser !== null);

        Logger.info('Successfully saved uploaded file to filesystem');
        return {
            status: 'ok',
            code: 200,
            data: {
                user: User.project(updatedUser),
            },
        };
    },
});

/**
 * @version v1.0.0
 * @method POST
 *
 * @url /api/resources/publication/upload?revision=...
 * @example
 * https://af268.cs.st-andrews.ac.uk/api/resources/publication/upload/some-name?revision=v1.0.0
 *
 * @description Endpoint for uploading resources to publications
 */
registerRoute(router, '/upload/publication/:id', {
    params: z.object({ id: ObjectIdSchema }),
    query: z.object({ revision: z.string().optional() }),
    body: z.any(),
    headers: z.object({}),
    method: 'post',
    permission: { level: IUserRole.Moderator },
    permissionVerification: verifyPublicationIdPermission,
    handler: async (req) => {
        const file = extractFile(req.raw);

        if (!file) {
            return {
                status: 'error',
                code: 400,
                message: errors.BAD_REQUEST,
                errors: {
                    file: {
                        message: 'No file sent',
                    },
                },
            };
        }

        // check file size is no bigger than 25MiB
        if (file.size > 1024 * 1024 * 25) {
            throw new errors.ApiError(413, 'The file size is too large, limit is 25MiB.', {
                file: {
                    message: 'File size too large. Must be less than 25MiB',
                    code: errors.CODES.RESOURCE_UPLOAD_TOO_LARGE,
                },
            });
        }

        // @Security: Ensure that the actual uploaded file is sane and don't just rely on mimetype.
        // Check that the mime-type of the file upload is either a plain text file or an
        // "application/zip" representing an archive. Other mime-types are currently banned
        // and we don't allow binary data uploads (at the moment).
        if (file.mimetype !== 'application/zip') {
            return {
                status: 'error',
                code: 415,
                message: errors.BAD_REQUEST,
                errors: {
                    file: {
                        message:
                            "Invalid file mimetype sent. Publication uploads only accepts 'application/zip' mime-type.",
                    },
                },
            };
        }

        // Verify that the zip file isn't corrupted by loading it using the zip file
        // library. We will try to list the root entries of the archive to see if there
        // are any problems with the archive
        if (!zip.testArchive(file.tempFilePath)) {
            return {
                status: 'error',
                code: 415,
                message: errors.BAD_REQUEST,
                errors: {
                    file: {
                        message: 'Provided ZIP Archive is corrupt or malformed',
                    },
                },
            };
        }

        const publication = await Publication.findById(req.params.id).exec();

        if (!publication) {
            return {
                status: 'error',
                code: 404,
                message: errors.RESOURCE_NOT_FOUND,
            };
        }

        let uploadPath = joinPathsForResource('publication', req.requester.id, publication.name);

        // now we need to append the revision number if it actually exists...
        if (req.query.revision && !publication.current) {
            uploadPath = joinPathsRaw(uploadPath, req.query.revision, 'publication.zip');
        } else {
            uploadPath = joinPathsRaw(uploadPath, 'publication.zip');
        }

        // If for some reason, this archive does not have a publication source attached to it, we can allow
        // an upload to occur...
        if (!publication.draft && (await fs.resourceExists(uploadPath))) {
            return {
                status: 'error',
                code: 400,
                message: errors.BAD_REQUEST,
                errors: {
                    file: {
                        code: errors.CODES.PUBLICATION_ARCHIVE_EXISTS,
                        message: "Cannot modify publication sources that aren't marked as draft.",
                    },
                } as ResponseErrorSummary,
            };
        }

        // Move the file into it's appropriate storage location
        await file.mv(uploadPath);

        // @@Hack: we also want to mark the activity that corresponds to creating the publication as 'live' now
        await Activity.updateOne(
            {
                type: IActivityType.Publication,
                document: publication._id.toString(),
                isLive: false,
            },
            { $set: { isLive: true } },
        ).exec();

        // Update the publication to become live instead of draft
        await publication.updateOne({ $set: { draft: false } }).exec();

        Logger.info(`Successfully saved uploaded file to filesystem at: ${uploadPath}`);
        return { status: 'ok', code: 200 };
    },
});

/**
 * @version v1.0.0
 * @method POST
 *
 * @url /api/resources/upload/review/:id
 * @example
 * https://af268.cs.st-andrews.ac.uk/api/resources/upload/review/617ec2675afcca834c21b5fd
 *
 * Endpoint for uploading attachments on review comments, items such as images/files or even
 * videos.
 */
registerRoute(router, '/upload/review/:id', {
    params: z.object({ id: ObjectIdSchema }),
    query: z.object({}),
    headers: z.object({}),
    body: z.any(),
    method: 'post',
    permissionVerification: verifyReviewPermission,
    permission: { level: IUserRole.Moderator },
    handler: async (_req) => {
        return {
            status: 'error',
            code: 503,
            message: 'Service Unavailable',
        };
    },
});

export default router;
