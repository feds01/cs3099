import { Response, agent as supertest } from 'supertest';

import app from '../../../src/app';
import Follower from '../../../src/models/Follower';
import User, { IUserDocument } from '../../../src/models/User';

const request = supertest(app);

describe('Follower endpoints testing ', () => {
    let followee: (IUserDocument & { _id: string | undefined }) | null;
    let follower1: (IUserDocument & { _id: string | undefined }) | null;
    let follower2: (IUserDocument & { _id: string | undefined }) | null;
    let followeeRes: Response;
    let follower1Res: Response;
    let follower2Res: Response;

    it('should create a followee and two followers', async () => {
        async function createAndLogin(username: string): Promise<Response> {
            const registerResponse = await request.post('/auth/register').send({
                email: `${username}@email.com`,
                username: username,
                name: username,
                password: 'Passwordexample123!',
                about: `I am ${username}`,
                profilePictureUrl: 'https://nothing-to-show.com',
            });
            expect(registerResponse.status).toBe(201);

            const loginResponse = await request.post('/auth/login').send({
                username,
                password: 'Passwordexample123!',
            });
            expect(loginResponse.status).toBe(200);

            return loginResponse;
        }

        followeeRes = await createAndLogin('followee');
        follower1Res = await createAndLogin('follower1');
        follower2Res = await createAndLogin('follower2');

        followee = await User.findOne({ username: 'followee' });
        follower1 = await User.findOne({ username: 'follower1' });
        follower2 = await User.findOne({ username: 'follower2' });
    });

    // Tests for POST /username/follow

    it('follower1 follows followee', async () => {
        const followResponse = await request
            .post(`/user/followee/follow`)
            .auth(follower1Res.body.token, { type: 'bearer' });
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
            .auth(follower1Res.body.token, { type: 'bearer' });

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
            .auth(follower2Res.body.token, { type: 'bearer' });
        expect(followResponse.status).toBe(201);

        const followDoc = await Follower.count({ following: followee!.id });
        expect(followDoc).toBe(2);
    });

    it('follower2 unfollows followee', async () => {
        const unfollowResponse = await request
            .delete('/user/followee/follow')
            .auth(follower2Res.body.token, { type: 'bearer' });
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
            .auth(follower1Res.body.token, { type: 'bearer' });
        expect(isFollowingResponse.status).toBe(200);
        expect(isFollowingResponse.body.following).toBe(true);

        // If the user isn't following the user, the service should still reply with '200'.
        // Testing the body property 'following' specifies if the user is following the other
        // user or not
        const notFollowingResponse = await request
            .get('/user/followee/follow')
            .auth(follower2Res.body.token, { type: 'bearer' });

        expect(notFollowingResponse.status).toBe(200);
        expect(notFollowingResponse.body.following).toBe(false);
    });

    it("Get followee's follower list", async () => {
        const followerListResponse = await request
            .get('/user/followee/followers')
            .auth(follower1Res.body.token, { type: 'bearer' });
        expect(followerListResponse.status).toBe(200);
        expect(followerListResponse.body.followers).toEqual([follower1Res.body.user]);
    });

    it("Get follower1's following list", async () => {
        const followingListResponse = await request
            .get('/user/follower1/following')
            .auth(follower1Res.body.token, { type: 'bearer' });
        expect(followingListResponse.status).toBe(200);
        expect(followingListResponse.body.followers).toEqual([followeeRes.body.user]);
    });

    it("Get follower2's following list", async () => {
        // make the request to get all the followers
        const followingListResponse = await request
            .get('/user/follower2/following')
            .auth(follower2Res.body.token, { type: 'bearer' });

        // Verify that the use has no followers
        expect(followingListResponse.status).toBe(200);
        expect(followingListResponse.body.followers).toEqual([]);
    });

    it('should delete all users and all following maps', async () => {
        const deleteFollowee = await request
            .delete('/user/followee')
            .auth(followeeRes.body.token, { type: 'bearer' });
        const deleteFollower1 = await request
            .delete('/user/follower1')
            .auth(follower1Res.body.token, { type: 'bearer' });
        const deleteFollower2 = await request
            .delete('/user/follower2')
            .auth(follower2Res.body.token, { type: 'bearer' });

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
