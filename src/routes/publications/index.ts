import { z } from 'zod';
import express from 'express';
import * as zip from "./../../wrappers/zip";
import { IUserRole } from '../../models/User';
import * as errors from "./../../common/errors";
import * as userUtils from "./../../utils/users";
import registerRoute from '../../wrappers/requests';
import { ModeSchema } from '../../validators/requests';

const router = express.Router();


registerRoute(router, '/:username/:title/:revision?/tree/:path(*)', {
    method: 'get',
    params: z.object({ username: z.string(), title: z.string(), path: z.string().optional(), revision: z.string().optional(), }),
    query: z.object({mode: ModeSchema}),
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        const {title, revision, path} = req.params;

        // TODO: We need to check that the actual revision exists
        // TODO: We need to get the actual publication entry

        let archive = {
            userId: user.id!,
            name: title,
            ...(typeof revision !== 'undefined' && { revision })  
        }

        const transformedPath = path ?? "/";
        const entry = zip.getEntry(archive, transformedPath === "" ? "/" : transformedPath);

        if (!entry) {
            return res.status(404).json({
                status: false,
                message: errors.RESOURCE_NOT_FOUND,
            })
        } else {
            return res.status(200).json({
                status: true,
                data: entry
            })
        }
    }
});

export default router;
