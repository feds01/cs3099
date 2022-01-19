import { z } from 'zod';
import * as errors from '../../common/errors';
import express from 'express';
import Logger from '../../common/logger';
import { IUserRole } from '../../models/User';
import * as userUtils from '../../utils/users';
import Publication from '../../models/Publication';
import registerRoute from '../../lib/requests';
import { ModeSchema, ObjectIdSchema } from '../../validators/requests';
import { joinPathsForResource, extractFile, joinPathsRaw } from '../../utils/resources';

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
    method: 'post',
    permission: { kind: 'resource', level: IUserRole.Default },
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        const file = extractFile(req.raw);

        if (!file) {
            return res.status(400).json({
                status: 'error',
                message: errors.BAD_REQUEST,
                extra: 'No file sent.',
            });
        }

        // @@Security: Ensure that the actual uploaded file is sane and don't just rely on mimetype.

        // check here that the correct mime type is set on the file, for now we
        // only accept jpg/png images...
        if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg') {
            return res.status(400).json({
                status: 'error',
                message: errors.BAD_REQUEST,
                extra: "Invalid file mimetype sent. Image upload only accepts 'png' or 'jpeg'.",
            });
        }

        const uploadPath = joinPathsForResource('avatar', user.username, 'avatar');

        // Move the file into it's appropriate storage location
        return file.mv(uploadPath, (err) => {
            if (err) {
                Logger.error(err);

                return res.status(500).json({
                    status: 'error',
                    message: errors.INTERNAL_SERVER_ERROR,
                });
            }

            Logger.info('Successfully saved uploaded file to filesystem');
            return res.status(200).json({
                status: 'ok',
                message: 'Successfully uploaded file.',
            });
        });
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
    method: 'post',
    permission: { kind: 'resource', level: IUserRole.Default },
    handler: async (req, res) => {
        const { id } = req.params;
        const { revision } = req.query;
        const { id: userId } = req.requester;
        const file = extractFile(req.raw);

        if (!file) {
            return res.status(400).json({
                status: 'error',
                message: 'Bad Request. No file sent',
            });
        }

        // @@Security: Ensure that the actual uploaded file is sane and don't just rely on mimetype.
        // Check that the mime-type of the file upload is either a plain text file or an
        // "application/zip" representing an archive. Other mime-types are currently banned
        // and we don't allow binary data uploads (at the moment).
        if (file.mimetype !== 'application/zip') {
            return res.status(400).json({
                status: 'error',
                message: errors.BAD_REQUEST,
                extra: "Invalid file mimetype sent. Publication uploads only accepts 'application/zip' mime-type.",
            });
        }

        const publication = await Publication.findById(id).exec();

        if (!publication) {
            return res.status(404).json({
                status: 'error',
                message: errors.RESOURCE_NOT_FOUND,
            });
        }

        if (!publication.draft) {
            return res.status(400).json({
                status: 'error',
                message: 'Cannot modify publication sources.',
            });
        }

        let uploadPath = joinPathsForResource('publication', userId, publication.name);

        // now we need to append the revision number if it actually exists...
        if (revision) {
            uploadPath = joinPathsRaw(uploadPath, revision, 'publication.zip');
        } else {
            uploadPath = joinPathsRaw(uploadPath, 'publication.zip');
        }

        // Move the file into it's appropriate storage location
        return file.mv(uploadPath, async (err) => {
            if (err) {
                Logger.error(err);

                return res.status(500).json({
                    status: 'error',
                    message: errors.INTERNAL_SERVER_ERROR,
                });
            }

            // Update the publication to become live instead of draft
            await publication.update({ $set: { draft: false } }).exec();

            Logger.info(`Successfully saved uploaded file to filesystem at: ${uploadPath}`);
            return res.status(200).json({
                status: 'ok',
                message: 'Successfully uploaded file.',
            });
        });
    },
});

/**
 * @version v1.0.0
 * @method POST
 *
 * @url /api/resources/reviews/upload/:id
 * @example
 * https://af268.cs.st-andrews.ac.uk/api/resources/reviews/upload/617ec2675afcca834c21b5fd
 *
 * Endpoint for uploading attachements on reviwew commetns, items such as images/files or even
 * videos.
 */
registerRoute(router, '/upload/review/:id', {
    params: z.object({ id: ObjectIdSchema }),
    query: z.object({}),
    body: z.any(),
    method: 'post',
    permission: { kind: 'resource', level: IUserRole.Default },
    handler: async (req, res) => {
        const { id } = req.params;
        const { id: userId } = req.requester;

        console.log(id, userId);

        return res.status(503).json({
            status: 'error',
            message: 'Service Unavailable',
        });
    },
});

export default router;
