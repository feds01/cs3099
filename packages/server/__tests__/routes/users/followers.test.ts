import { beforeAll, describe, expect, it } from '@jest/globals';
import { agent as supertest } from 'supertest';

import app from '../../../src/app';
import Follower from '../../../src/models/Follower';
import User, { AugmentedUserDocument } from '../../../src/models/User';
import { createMockedUser } from '../../utils/factories/user';
import {
    AuthenticationResponse,
    registerUserAndAuthenticate,
} from '../../utils/requests/createUser';

const request = supertest(app);

describe('Follower endpoints testing ', () => {
    let followeeRes: AuthenticationResponse;
    let follower1Res: AuthenticationResponse;
    let follower2Res: AuthenticationResponse;

    let followee: AugmentedUserDocument | null;
    let follower1: AugmentedUserDocument | null;
    let follower2: AugmentedUserDocument | null;

    beforeAll(async () => {
        followeeRes = await registerUserAndAuthenticate(
            request,
            createMockedUser({ username: 'followee' }),
        );
        follower1Res = await registerUserAndAuthenticate(
            request,
            createMockedUser({ username: 'follower1' }),
        );
        follower2Res = await registerUserAndAuthenticate(
            request,
            createMockedUser({ username: 'follower2' }),
        );

        followee = (await User.findById(followeeRes.user.id)) as unknown as AugmentedUserDocument;
        follower1 = (await User.findById(follower1Res.user.id)) as unknown as AugmentedUserDocument;
        follower2 = (await User.findById(follower2Res.user.id)) as unknown as AugmentedUserDocument;
    });

    // Tests for POST /username/follow
    it('follower1 follows followee', async () => {
        const followResponse = await request
            .post(`/user/followee/follow`)
            .auth(follower1Res.token, { type: 'bearer' });
        expect(followResponse.status).toBe(201);

        const followDoc = await Follower.count({
            follower: follower1!.id,
            following: followee!.id,
        });
        expect(followDoc).toBe(1);
    });

    it('follower1 follows followee again', async () => {
        const followResponse = await request
            .post(`/user/followee/follow`)
            .auth(follower1Res.token, { type: 'bearer' });

        // Attempting to follow a user again will respond with a '200', but internally it will
        // do nothing...
        expect(followResponse.status).toBe(200);

        const followDoc = await Follower.count({
            follower: follower1!.id,
            following: followee!.id,
        });
        expect(followDoc).toBe(1);
    });

    it('follower2 follows followee', async () => {
        const followResponse = await request
            .post('/user/followee/follow')
            .auth(follower2Res.token, { type: 'bearer' });
        expect(followResponse.status).toBe(201);

        const followDoc = await Follower.count({ following: followee!.id });
        expect(followDoc).toBe(2);
    });

    it('follower2 unfollows followee', async () => {
        const unfollowResponse = await request
            .delete('/user/followee/follow')
            .auth(follower2Res.token, { type: 'bearer' });
        expect(unfollowResponse.status).toBe(200);

        const followDoc = await Follower.count({
            follower: follower2!.id,
            following: followee!.id,
        });
        expect(followDoc).toBe(0);
    });

    it('check if follower1 is following followee and follower2 is not', async () => {
        const isFollowingResponse = await request
            .get('/user/followee/follow')
            .auth(follower1Res.token, { type: 'bearer' });
        expect(isFollowingResponse.status).toBe(200);
        expect(isFollowingResponse.body.following).toBe(true);

        // If the user isn't following the user, the service should still reply with '200'.
        // Testing the body property 'following' specifies if the user is following the other
        // user or not
        const notFollowingResponse = await request
            .get('/user/followee/follow')
            .auth(follower2Res.token, { type: 'bearer' });

        expect(notFollowingResponse.status).toBe(200);
        expect(notFollowingResponse.body.following).toBe(false);
    });

    it("Get followee's follower list", async () => {
        const followerListResponse = await request
            .get('/user/followee/followers')
            .auth(follower1Res.token, { type: 'bearer' });
        expect(followerListResponse.status).toBe(200);
        expect(followerListResponse.body.followers).toEqual([follower1Res.user]);
    });

    it("Get follower1's following list", async () => {
        const followingListResponse = await request
            .get('/user/follower1/following')
            .auth(follower1Res.token, { type: 'bearer' });
        expect(followingListResponse.status).toBe(200);
        expect(followingListResponse.body.followers).toEqual([followeeRes.user]);
    });

    it("Get follower2's following list", async () => {
        // make the request to get all the followers
        const followingListResponse = await request
            .get('/user/follower2/following')
            .auth(follower2Res.token, { type: 'bearer' });

        // Verify that the use has no followers
        expect(followingListResponse.status).toBe(200);
        expect(followingListResponse.body.followers).toEqual([]);
    });

    it('should delete all users and all following maps', async () => {
        const deleteFollowee = await request
            .delete('/user/followee')
            .auth(followeeRes.token, { type: 'bearer' });
        const deleteFollower1 = await request
            .delete('/user/follower1')
            .auth(follower1Res.token, { type: 'bearer' });
        const deleteFollower2 = await request
            .delete('/user/follower2')
            .auth(follower2Res.token, { type: 'bearer' });

        expect(deleteFollowee.status).toBe(200);
        expect(deleteFollower1.status).toBe(200);
        expect(deleteFollower2.status).toBe(200);

        // deleted user should not exist in followers collection
        const followDoc = await Follower.count({
            $or: [
                { follower: { $in: [follower1!.id, follower2!.id] } },
                { followee: followee!.id },
            ],
        });
        expect(followDoc).toBe(0);
    });
});
