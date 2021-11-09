import { z } from 'zod';
import express from 'express';
import Logger from '../../common/logger';
import * as errors from "./../../common/errors";
import * as userUtils from '../../utils/users';
import registerRoute from '../../lib/requests';
import User, { IUser, IUserRole } from '../../models/User';
import Publication, { IPublication } from '../../models/Publication';
import { ModeSchema } from '../../validators/requests';
import Bookmark from '../../models/Bookmark';

const router = express.Router();

/**
 * @version v1.0.0
 * @method POST
 * @url api/publication/<id>/bookmark
 * @example
 * https://af268.cs.st-andrews.ac.uk/api/publications/XXXXXXXX/bookmark
 * >>> body: {}
 *
 * @description This route is used to bookmark a publication. The router accepts a token
 * in the header and retrieves the current user id from the token, it also
 * accepts the publication's title which is specified in the url. Then it adds a
 * mapping of them to the database.
 *
 * @error {ALREADY_BOOKMARKED} if the publication is already bookmarked by the current user.
 * @error {NON_EXISTENT_PUBLICATION} if the specified publication does not exist.
 *
 * @return response to client if mapping was created and added to the system.
 * */
registerRoute(router, '/:username/:name/bookmark', {
    method: 'post',
    params: z.object({
        username: z.string().nonempty(),
        name: z.string().nonempty()
    }),
    body: z.object({}),
    query: z.object({ mode: ModeSchema }),
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        const { username, name } = req.params;

        // check if the publication exists, if not then exit early.
        const publication = await Publication.findOne({ username, name }).exec();


        if (!publication) {
            return res.status(404).json({
                status: false,
                message: errors.NON_EXISTENT_PUBLICATION,
            });
        }

        let mapping = { user: user.id, publication: publication.id };

        // check if the publication is already bookmarked, if so, exit early and return
        // corresponding messages
        const doc = await Bookmark.findOne(mapping).exec();

        if (doc) {
            return res.status(204).json({
                status: true
            });
        }

        const newBookmark = new Bookmark(mapping);
        try {
            newBookmark.save();

            return res.status(200).json({
                status: true,
                message: 'Successfully bookmarked publication.',
            });
        } catch (e) {
            Logger.error(e);

            return res.status(500).json({
                status: false,
                message: errors.INTERNAL_SERVER_ERROR,
            });
        }
    },
});

/**
 * @version v1.0.0
 * @method DELETE
 * @url api/publication/<id>/bookmark
 * @example
 * https://af268.cs.st-andrews.ac.uk/api/publications/XXXXXXXX/bookmark
 * >>> body: {}
 *
 * @description This route is used to un-bookmark a publication. The router accepts a token
 * in the header and retrieves the current user id from the token, it also
 * accepts the publication's title which is specified in the url. Then it removes a
 * mapping of them from the database.
 *
 * @error {NOT_BOOKMARKED} if the publication is not bookmarked by the current user.
 * @error {NON_EXISTENT_PUBLICATION} if the specified publication does not exist.
 *
 * @return response to client if mapping was found and deleted from the system.
 * */
registerRoute(router, '/:username/:name/bookmark', {
    method: 'delete',
    params: z.object({
        username: z.string().nonempty(),
        name: z.string().nonempty()
    }),
    query: z.object({ mode: ModeSchema }),
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        const { username, name } = req.params;

        // check if the publication exists, if not then exit early.
        const publication = await Publication.findOne({ username, name }).exec();


        if (!publication) {
            return res.status(404).json({
                status: false,
                message: errors.NON_EXISTENT_PUBLICATION,
            });
        }

        await Bookmark.findOneAndDelete({
            user: user.id,
            publication: publication.id,
        }).exec();

        return res.status(204);
    },
});

/**
 * @version v1.0.0
 * @method GET
 * @url api/publication/<name>/bookmark
 * @example
 * https://af268.cs.st-andrews.ac.uk/api/publications/XXXXXXXX/bookmark
 * >>> body: {}
 *
 * @description This route is used to check if a user has bookmarked a publication.
 * The router accepts a token in the header and retrieves the current user id from
 * the token, it also accepts the publication's title which is specified in the url.
 * Then it removes a mapping of them from the database.
 *
 * @error {NOT_BOOKMARKED} if the publication is not bookmarked by the current user.
 * @error {NON_EXISTENT_PUBLICATION} if the specified publication does not exist.
 *
 * @return response to client if mapping was found and deleted from the system.
 * */
registerRoute(router, '/:username/:name/bookmark', {
    method: 'get',
    params: z.object({
        username: z.string().nonempty(),
        name: z.string().nonempty()
    }),
    query: z.object({ mode: ModeSchema }),
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        const { username, name } = req.params;

        // check if the publication exists, if not then exit early.
        const publication = await Publication.findOne({ username, name }).exec();

        if (!publication) {
            return res.status(404).json({
                status: false,
                message: errors.NON_EXISTENT_PUBLICATION,
            });
        }

        const link = await Bookmark.findOne({
            user: user.id,
            publication: publication.id,
        }).exec();

        return res.status(200).json({
            status: false,
            bookmarked: !!link,
        });
    },
});

/**
 * @version v1.0.0
 * @method GET
 * @url api/publication/<name>/bookmarkers
 * @example
 * https://af268.cs.st-andrews.ac.uk/api/publications/XXXXXXXX/bookmark
 * >>> body: {}
 *
 * @description This route is used to check all user who have bookmarked a publication.
 * The router accepts a token in the header and retrieves the current user id from
 * the token, it also accepts the publication's title which is specified in the url.
 * Then it removes a mapping of them from the database.
 *
 * @error {NON_EXISTENT_PUBLICATION} if the specified publication does not exist.
 *
 * @return response to client of all users who have bookmarked the publication.
 * */
registerRoute(router, '/:username/:name/bookmarkers', {
    method: 'get',
    params: z.object({
        username: z.string().nonempty(),
        name: z.string().nonempty()
    }),
    query: z.object({ mode: ModeSchema }),
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        const { username, name } = req.params;

        // check if the publication exists, if not then exit early.
        const publication = await Publication.findOne({ username, name }).exec();

        if (!publication) {
            return res.status(404).json({
                status: false,
                message: errors.NON_EXISTENT_PUBLICATION,
            });
        }

        const result = await Bookmark.find({ publication: publication.id })
            .populate<{ user: IUser }[]>('user')
            .limit(50);

        // Project all the users into actual data...
        const bookmarks = result.map((link) =>
            User.project((link as typeof result[number]).user),
        );

        return res.status(200).json({
            status: true,
            bookmarks
        });
    },
});

/**
 * @version v1.0.0
 * @method GET
 * @url api/publication/<username>/bookmarks
 * @example
 * https://af268.cs.st-andrews.ac.uk/api/publications/XXXXXXXX/bookmark
 * >>> body: {}
 *
 * @description This route is used to check all bookmarked publications by a user.
 *
 * @return response to client of bookmarked publications.
 * */
registerRoute(router, '/:username/bookmarks', {
    method: 'get',
    params: z.object({ username: z.string().nonempty() }),
    query: z.object({ mode: ModeSchema }),
    permission: IUserRole.Default,
    handler: async (req, res) => {
        const user = await userUtils.transformUsernameIntoId(req, res);
        if (!user) return;

        //TODO @James: Privacy controls?

        const result = await Bookmark.find({ user: user.id })
            .populate<{ publication: IPublication }[]>('publication')
            .limit(50);

        // project each publication and then return it
        const bookmarked = await Promise.all(result.map(async (bookmark) =>
            await Publication.project(bookmark.publication as typeof result[number]['publication']),
        ));

        return res.status(200).json({
            status: true,
            bookmarked,
        });
    },
});

export default router;
