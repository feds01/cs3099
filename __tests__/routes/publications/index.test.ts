<<<<<<< HEAD
import app from '../../../src/app';
=======
>>>>>>> origin/main
import * as errors from '../../../src/common/errors';
import app from '../../../src/app';
import Publication from '../../../src/models/Publication';
import User, { IUserDocument } from '../../../src/models/User';
<<<<<<< HEAD
import { agent as supertest, Response } from 'supertest';
=======

import { Response, agent as supertest } from 'supertest';
>>>>>>> origin/main

const request = supertest(app);

describe('Publications endpoints testing', () => {
    let owner: (IUserDocument & { _id: string | undefined }) | null;
    let collabo1: (IUserDocument & { _id: string | undefined }) | null;
    let collabo2: (IUserDocument & { _id: string | undefined }) | null;
    let ownerRes: Response;
    let collabo1Res: Response;
    let collabo2Res: Response;

    it('should create a owner and two collaborators', async () => {
        async function createAndLogin(username: string): Promise<Response> {
            const registerResponse = await request.post('/auth/register').send({
                email: `${username}@email.com`,
                username: username,
                firstName: username,
                lastName: username,
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

        ownerRes = await createAndLogin('owner');
        collabo1Res = await createAndLogin('collabo1');
        collabo2Res = await createAndLogin('collabo2');

        owner = await User.findOne({ username: 'owner' });
        collabo1 = await User.findOne({ username: 'collabo1' });
        collabo2 = await User.findOne({ username: 'collabo2' });
    });

    // Tests for POST /publication/

    it('should create a publication', async () => {
        const response = await request
            .post('/publication/')
            .auth(ownerRes.body.token, { type: 'bearer' })
            .send({
                revision: 'v1',
                title: 'Test title',
                name: 'Test-name',
                introduction: 'Introduction here',
                collaborators: ['collabo1', 'collabo2'],
            });
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Successfully submitted new publication.');
        expect(response.body.publication.title).toBe('Test title');
        expect(response.body.publication.name).toBe('test-name');
        expect(response.body.publication.introduction).toBe('Introduction here');
        expect(response.body.publication.collaborators).toEqual([collabo1!.id, collabo2!.id]);
        expect(response.body.publication.owner).toStrictEqual(User.project(owner as IUserDocument));

        const publication = await Publication.count({ name: 'test-name', revision: 'v1' });
        expect(publication).toBe(1);
    });

    it('should create a publication with the same name and different revision', async () => {
        const response = await request
            .post('/publication/')
            .auth(ownerRes.body.token, { type: 'bearer' })
            .send({
                revision: 'v2',
                title: 'Test title',
                name: 'Test-name',
                introduction: 'Introduction here',
                collaborators: ['collabo1', 'collabo2'],
            });
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Successfully submitted new publication.');

        const publication = await Publication.count({ name: 'test-name', revision: 'v2' });
        expect(publication).toBe(1);
    });

    it('should not create a publication with a redundant name and revision', async () => {
        const response = await request
            .post('/publication/')
            .auth(ownerRes.body.token, { type: 'bearer' })
            .send({
                revision: 'v1',
                title: 'Test title',
                name: 'Test-name',
                introduction: 'Introduction here',
                collaborators: ['collabo1', 'collabo2'],
            });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe(errors.PUBLICATION_FAILED);
        expect(response.body.extra).toBe(errors.PUBLICATION_EXISTS);

        const publicationNum = await Publication.count({ name: 'test-name', revision: 'v1' });
        expect(publicationNum).toBe(1);
    });

    it('should not create a publication with a non-existent collaborator', async () => {
        const response = await request
            .post('/publication/')
            .auth(ownerRes.body.token, { type: 'bearer' })
            .send({
                revision: 'v1',
                title: 'Test title',
                name: 'Test-name-2',
                introduction: 'Introduction here',
                collaborators: ['collabo1', 'collabo3'],
            });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe(
            "Bad request, endpoint body schema didn't match to provided body.",
        );
    });

    // Tests for GET /publication/:username/:name/:revision?/tree/:path(*)

    // Tests for GET /publication/:username/
    it('should get all publications of a user', async () => {
        const response = await request
            .get('/publication/owner')
            .auth(ownerRes.body.token, { type: 'bearer' });
        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(2);
        // expect no duplicate in response.body.data (Should change the implementation of the API)
        // expect(response.body.data).toHaveLength(new Set(response.body.data.map(JSON.stringify)).size);
    });

    // Tests for GET /publication/:username/:name/revisions
    // TODO: change the implementation of API to fit this test
    // it("should get all revisions of a publication", async () => {
    //     const response = await request.get('/publication/owner/test-name').auth(ownerRes.body.token, {type: 'bearer'});
    //     expect(response.status).toBe(200);
    //     expect(response.body.data).toHaveLength(2);
    //     expect(response.body.data[0].revision).toBe('v1');
    //     expect(response.body.data[1].revision).toBe('v2');
    // });

    // Tests for GET /publication/:username/:revision?

    it('should delete the owner and two collaborators', async () => {
        const deleteOwner = await request
            .delete('/user/owner')
            .auth(ownerRes.body.token, { type: 'bearer' });
        const deleteCollabo1 = await request
            .delete('/user/collabo1')
            .auth(collabo1Res.body.token, { type: 'bearer' });
        const deleteCollabo2 = await request
            .delete('/user/collabo2')
            .auth(collabo2Res.body.token, { type: 'bearer' });
        expect(deleteOwner.status).toBe(200);
        expect(deleteCollabo1.status).toBe(200);
        expect(deleteCollabo2.status).toBe(200);
    });
});
