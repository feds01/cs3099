import { z } from 'zod';
import * as errors from '../../common/errors';
import express, { Router } from 'express';
import Logger from '../../common/logger';
import Publication from '../../models/Publications';
import { IUserRole } from '../../models/User';
import * as userUtils from '../../utils/users';
import { registerRoute } from '../../wrappers/requests';
import { joinPaths, extractFile } from '../../utils/resources';
import { ModeSchema, ObjectIdSchema } from '../../validators/requests';

const router = express.Router();

/**
 * Endpoint for uploading avatar to the server.
 */
registerRoute(router, '/upload/:username', {
    params: z.object({ username: z.string() }),
    query: z.object({ mode: ModeSchema }),
    body: z.any(),
    method: 'post',
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        const file = extractFile(req.raw);

        if (!file) {
            return res.status(400).json({
                status: false,
                message: 'Bad Request. No file sent',
            });
        }

        const uploadPath = joinPaths('avatar', user.username, 'avatar');

        // Move the file into it's appropriate storage location
        return file.mv(uploadPath, (err) => {
            if (err) {
                Logger.error(err);

                return res.status(500).json({
                    status: false,
                    message: errors.INTERNAL_SERVER_ERROR,
                });
            }

            Logger.info('Successfully saved uploaded file to filesystem');
            return res.status(200).json({
                status: false,
                message: 'Successfully uploaded file.',
            });
        });
    },
});

/**
 * Endpoint for uploading resources to publications
 */
registerRoute(router, '/upload/publication/:title', {
    params: z.object({ title: z.string() }),
    query: z.object({}),
    body: z.any(),
    method: 'post',
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const { title } = req.params;
        const { username } = req.token;
        const file = extractFile(req.raw);

        if (!file) {
            return res.status(400).json({
                status: false,
                message: 'Bad Request. No file sent',
            });
        }

        const publication = await Publication.findOne({ title });

        if (!publication) {
            return res.status(404).json({
                status: false,
                message: errors.RESOURCE_NOT_FOUND,
            });
        }

        const uploadPath = joinPaths('publications', username, publication.id);

        // Move the file into it's appropriate storage location
        return file.mv(uploadPath, (err) => {
            if (err) {
                Logger.error(err);

                return res.status(500).json({
                    status: false,
                    message: errors.INTERNAL_SERVER_ERROR,
                });
            }

            Logger.info('Successfully saved uploaded file to filesystem');
            return res.status(200).json({
                status: false,
                message: 'Successfully uploaded file.',
            });
        });
    },
});

/**
 * Endpoint for uploading comment attachments to a publication
 */
registerRoute(router, '/upload/comment/:username/:id', {
    params: z.object({ username: z.string(), id: ObjectIdSchema }),
    query: z.object({ mode: ModeSchema }),
    body: z.any(),
    method: 'post',
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        throw new Error('Unimplemented');
    },
});

export default Router;
