import { ZodError } from 'zod';
import express from 'express';
import User, { IUser } from '../../models/User';
import Logger from '../../common/logger';
import * as error from '../../common/errors';
import Follower from '../../models/Follower';
import { ownerAuth } from '../../auth';

const router = express.Router({ mergeParams: true });

/**
 * @version v1.0.0
 * @method POST
 * @url api/user/<id>/follow
 * @example
 * https://af268.cs.st-andrews.ac.uk/api/user/616f115feb325663f8bce3a4/follow
 * >>> body: {}
 *
 * @description This route is used to follow a user. The router accepts a token
 * in the header and retrieves the current user id from the token, it also
 * accepts the followee's id which is specified in the url. Then it adds a
 * mapping of them to the database.
 *
 * @error {ALREADY_FOLLOWED} if the followee is already followed by the current user.
 * @error {SELF_FOLLOWING} if the user account is trying to follow itself.
 * @error {NON_EXISTENT_USER} if the specified user does not exist.
 *
 * @return response to client if mapping was created and added to the system.
 * */

router.post('/:username/follow', ownerAuth, async (req, res) => {
    const { username } = req.params;
    const { id: followerId } = req.token.data;

    // check if the user is already following the other user, if so
    // then exit early and don't create the new follower link.
    const follower = await User.findById(followerId).exec();
    const following = await User.findById({ username }).exec();

    if (!follower || !following) {
        return res.status(404).json({
            status: false,
            message: error.NON_EXISTENT_USER_ID,
        });
    }

    // Just return a NoContent
    if (follower._id === following._id) {
        return res.status(204).json({
            status: true,
        });
    }

    let mapping = { follower: follower._id, following: following._id };

    // check if the user is already following, if so, exit early and return
    // corresponding messages
    const doc = await Follower.findOne(mapping).exec();

    if (doc) {
        return res.status(401).json({
            status: false,
            message: error.ALREADY_FOLLOWED,
        });
    }

    const newFollow = new Follower(mapping);
    try {
        newFollow.save();

        return res.status(201).json({
            status: true,
            message: 'Successfully followed user.',
        });
    } catch (e) {
        Logger.error(e);

        return res.status(500).json({
            status: false,
            message: error.INTERNAL_SERVER_ERROR,
        });
    }
});

router.delete('/:username/follow', ownerAuth, async (req, res) => {
    const { username } = req.params;
    const { id: followerId } = req.token.data;

    // check if the user is already following the other user, if so
    // then exit early and don't create the new follower link.
    const follower = await User.findById(followerId).exec();
    const followee = await User.findOne({ username }).exec();

    if (!follower || !followee) {
        return res.status(404).json({
            status: false,
            message: error.NON_EXISTENT_USER_ID,
        });
    }

    const link = await Follower.findOneAndDelete({
        follower: follower._id,
        following: followee._id,
    }).exec();

    if (!link) {
        return res.status(404).json({
            status: true,
            message: "User isn't following the other user",
        });
    } else {
        return res.status(200).json({
            status: true,
            message: 'User was unfollowed',
        });
    }
});

router.get('/:username/follow', ownerAuth, async (req, res) => {
    const { username } = req.params;
    const { id: followerId } = req.token.data;

    // check if the user is already following the other user, if so
    // then exit early and don't create the new follower link.
    const follower = await User.findById(followerId).exec();
    const followee = await User.findOne({ username }).exec();

    if (!follower || !followee) {
        return res.status(404).json({
            status: false,
            message: error.NON_EXISTENT_USER_ID,
        });
    }

    const link = await Follower.findOne({ follower: follower._id, following: followee._id }).exec();

    if (!link) {
        return res.status(404).json({
            status: true,
            following: false,
            message: "User isn't following the other user",
        });
    } else {
        return res.status(200).json({
            status: true,
            following: true,
            message: 'User is following the other user',
        });
    }
});

router.get('/:username/followers', ownerAuth, async (req, res) => {
    const { username } = req.params;

    // then exit early and don't create the new follower link.
    const user = await User.findOne({ username }).exec();

    if (!user) {
        return res.status(404).json({
            status: false,
            message: error.NON_EXISTENT_USER_ID,
        });
    }

    // TODO:(alex) Implement pagination for this endpoint since the current limit will
    //             be 50 documents.
    // https://medium.com/swlh/mongodb-pagination-fast-consistent-ece2a97070f3
    const result = await Follower.find({ following: user._id })
        .populate<{ follower: IUser }[]>('follower')
        .limit(50);

    const followers = result.map((link) => User.project((link as typeof result[number]).follower));

    return res.status(200).json({
        status: true,
        data: {
            followers,
        },
    });
});

router.get('/:username/following', ownerAuth, async (req, res) => {
    const { username } = req.params;

    // then exit early and don't create the new follower link.
    const user = await User.findOne({ username }).exec();

    if (!user) {
        return res.status(404).json({
            status: false,
            message: error.NON_EXISTENT_USER_ID,
        });
    }

    // TODO:(alex) Implement pagination for this endpoint since the current limit will
    //             be 50 documents.
    // https://medium.com/swlh/mongodb-pagination-fast-consistent-ece2a97070f3
    const result = await Follower.find({ follower: user._id })
        .populate<{ following: IUser }[]>('following')
        .limit(50)
        .exec();

    const followers = result.map((link) => User.project((link as typeof result[number]).following));

    return res.status(200).json({
        status: true,
        data: {
            following: followers,
        },
    });
});

export default router;
