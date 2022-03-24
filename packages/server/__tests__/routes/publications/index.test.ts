import assert from 'assert';
import { Response, agent as supertest } from 'supertest';

import app from '../../../src/app';
import Publication from '../../../src/models/Publication';
import User, { IUserDocument } from '../../../src/models/User';

const request = supertest(app);

type PopulatedUserDocument = IUserDocument & { _id: string | undefined };

describe('Publications endpoints testing', () => {
    let owner: PopulatedUserDocument;
    let collaborator1: PopulatedUserDocument;
    let collaborator2: PopulatedUserDocument;

    let ownerRes: Response;
    let collaboratorResponse1: Response;
    let collaboratorResponse2: Response;

    it('should create a owner and two collaborators', async () => {
        async function createAndLogin(username: string): Promise<Response> {
            // Verify that the user can register an account
            const registerResponse = await request.post('/auth/register').send({
                email: `${username}@email.com`,
                username: username,
                name: username,
                password: 'Passwordexample123!',
                about: `I am ${username}`,
                profilePictureUrl: 'https://nothing-to-show.com',
            });

            expect(registerResponse.status).toBe(201);

            // Verify that the user can now login in after registering
            const loginResponse = await request.post('/auth/login').send({
                username,
                password: 'Passwordexample123!',
            });

            expect(loginResponse.status).toBe(200);

            return loginResponse;
        }

        ownerRes = await createAndLogin('owner');
        collaboratorResponse1 = await createAndLogin('collabo1');
        collaboratorResponse2 = await createAndLogin('collabo2');

        const ownerUser = await User.findOne({ username: 'owner' });
        assert(ownerUser !== null);

        owner = ownerUser;

        const user1 = await User.findOne({ username: 'collabo1' });
        const user2 = await User.findOne({ username: 'collabo2' });
        assert(user1 !== null && user2 !== null);

        collaborator1 = user1;
        collaborator2 = user2;
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
        expect(response.body.publication.title).toBe('Test title');
        expect(response.body.publication.name).toBe('test-name');
        expect(response.body.publication.introduction).toBe('Introduction here');

        // Verify that the the users have been projected...
        expect(response.body.publication.collaborators).toEqual([
            User.project(collaborator1),
            User.project(collaborator2),
        ]);

        // Verify that the owner has been projected...
        expect(response.body.publication.owner).toStrictEqual(User.project(owner));

        const publication = await Publication.count({ name: 'test-name', revision: 'v1' });
        expect(publication).toBe(1);
    });

    it('should return a bad request when creating a publication with the same name and different revision', async () => {
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

        expect(response.status).toBe(400);
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
        expect(response.body.message).toBe('Publication with the same name already exists');

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
        expect(response.body.message).toBe("Request parameters didn't match the expected format.");
    });

    describe('Uploading source code tests', () => {
        let pubID: Response;
        let pubName: Response;

        beforeEach(async () => {
            const response = await request
                .post('/publication/')
                .auth(ownerRes.body.token, { type: 'bearer' })
                .send({
                    revision: 'v1',
                    title: 'Source Code Test',
                    name: 'Source-Code-Test',
                    introduction: 'Introduction here',
                    collaborators: ['collabo1', 'collabo2'],
                });

            expect(response.status).toBe(201);

            pubID = response.body.publication.id;
            pubName = response.body.publication.name;
        });

        it('should upload source code to publication', async () => {
            const sourceUpload = await request
                .post(`/resource/upload/publication/${pubID}`)
                .auth(ownerRes.body.token, { type: 'bearer' })
                .attach('file', '__tests__/resources/sampleCode.zip');

            expect(sourceUpload.status).toBe(200);

            const pubDelete = await request
                .delete(`/publication/owner/${pubName}`)
                .auth(ownerRes.body.token, { type: 'bearer' });

            expect(pubDelete.status).toBe(200);
        });

        it('should fail to upload source code to publication when source already there', async () => {
            const sourceUpload = await request
                .post(`/resource/upload/publication/${pubID}`)
                .auth(ownerRes.body.token, { type: 'bearer' })
                .attach('file', '__tests__/resources/sampleCode.zip');

            expect(sourceUpload.status).toBe(200);

            const reUpload = await request
                .post(`/resource/upload/publication/${pubID}`)
                .auth(ownerRes.body.token, { type: 'bearer' })
                .attach('file', '__tests__/resources/sampleCode.zip');

            expect(reUpload.status).toBe(400);
            // @TODO JG Fix code test
            //expect(reUpload.).toBe(101);
        });
    });

    // Tests for GET /publication/:username/:name/:revision?/tree/:path(*)

    // Tests for GET /publication/:username/
    it('should get all publications of a user', async () => {
        // Make a request to get all of the publications of the user 'owner'
        const response = await request
            .get('/publication/owner')
            .auth(ownerRes.body.token, { type: 'bearer' });

        expect(response.status).toBe(200);
        expect(response.body.publications).toHaveLength(1);
    });

    // Tests for GET /publication/:username/:name/:revision?/tree/:path(*)

    // Tests for DELETE /publication/:username/:name
    it('should delete publication', async () => {
        // Make a request to get all of the publications of the user 'owner'
        const response = await request
            .delete('/publication/owner/Test-name')
            .auth(ownerRes.body.token, { type: 'bearer' });

        expect(response.status).toBe(200);
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

        const deleteCollaborator = await request
            .delete('/user/collabo1')
            .auth(collaboratorResponse1.body.token, { type: 'bearer' });

        const deleteCollaborator2 = await request
            .delete('/user/collabo2')
            .auth(collaboratorResponse2.body.token, { type: 'bearer' });

        expect(deleteOwner.status).toBe(200);
        expect(deleteCollaborator.status).toBe(200);
        expect(deleteCollaborator2.status).toBe(200);
    });
});
