import faker from '@faker-js/faker';
import assert from 'assert';
import mongoose from 'mongoose';
import { agent as supertest } from 'supertest';

import app from '../../../src/app';
import Publication from '../../../src/models/Publication';
import User, { IUserRole } from '../../../src/models/User';
import { createMockedPublication } from '../../utils/factories/publication';
import { createMockedUser } from '../../utils/factories/user';

const request = supertest(app);

describe('User endpoint tests ', () => {
    let testUserId: string;

    const UserObject = {
        email: 'test@email.com',
        username: 'test',
        name: 'test',
        password: 'Passwordexample123!',
        about: 'Nothing to say',
        profilePictureUrl: 'https://nothing-to-show.com',
    };

    // create a user and login before all tests
    it('should create a user', async () => {
        // call register api
        const registerResponse = await request.post('/auth/register').send(UserObject);

        // expect register to be successful
        expect(registerResponse.status).toBe(201);

        // update the user role to be administrator
        await User.findOneAndUpdate({ username: 'test' }, { role: IUserRole.Administrator });

        // call login api with username
        const loginResponse = await request.post('/auth/login').send({
            username: 'test',
            password: 'Passwordexample123!',
        });

        // expect login with username successfully
        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body.token).toBeDefined();
        expect(loginResponse.body.refreshToken).toBeDefined();

        // call login api with email
        const loginResponseEmail = await request.post('/auth/login').send({
            username: 'test@email.com',
            password: 'Passwordexample123!',
        });

        // expect login with email to be successful
        expect(loginResponseEmail.status).toBe(200);
        expect(loginResponseEmail.body.token).toBeDefined();
        expect(loginResponseEmail.body.refreshToken).toBeDefined();

        // set the bearer token and refresh token
        request.auth(loginResponse.body.token, { type: 'bearer' });
        request.set({ 'x-refresh-token': loginResponse.body.refreshToken });

        testUserId = loginResponse.body.user.id;
    });

    // fail to create a user with no username
    it('should fail to create a user with no username', async () => {
        // call register api without username field
        const { username, ...amendedRequestDto } = UserObject;
        const registrationResponse = await request.post('/auth/register').send(amendedRequestDto);

        expect(registrationResponse.status).toBe(400);
        expect(registrationResponse.body.errors).toHaveProperty('username');
    });

    // fail to create a user with no password
    it('should fail to create a user with no password', async () => {
        const { password, ...amendedRequestDto } = UserObject;
        const registrationResponse = await request.post('/auth/register').send(amendedRequestDto);

        expect(registrationResponse.status).toBe(400);
        expect(registrationResponse.body.errors).toHaveProperty('password');
    });

    // fail to create a user when username or email already taken
    it('should fail to create a user when username taken', async () => {
        // call register api with an inuse username
        const registerUserTaken = await request.post('/auth/register').send(UserObject);
        expect(registerUserTaken.status).toBe(400);
        expect(registerUserTaken.body.errors).toHaveProperty('username');

        // call register api with an inuse email
        const { username, ...registerDto } = UserObject;
        const registerEmailTaken = await request
            .post('/auth/register')
            .send({ ...registerDto, username: faker.internet.userName() });
        expect(registerEmailTaken.status).toBe(400);
        expect(registerEmailTaken.body.errors).toHaveProperty('email');
    });

    // Tests for querying users
    it('Getting Non-existing user with name', async () => {
        const response = await request.get('/user/notexist');
        expect(response.status).toBe(404);
    });

    it('Getting existing user with name', async () => {
        const response = await request.get('/user/test');
        expect(response.status).toBe(200);
    });

    it('Getting user with wrong id', async () => {
        const response = await request.get('/user/61843532859294ee3816fa74?mode=id');
        expect(response.status).toBe(404);
    });

    it('Getting user with correct id', async () => {
        const response = await request.get(`/user/${testUserId}?mode=id`);
        expect(response.status).toBe(200);
    });

    // Tests for PATCH /user/:username
    it("Updating user and check if user's information is updated", async () => {
        const mockedUser = createMockedUser();

        const requestDto = {
            email: mockedUser.email,
            username: mockedUser.username,
            name: mockedUser.name,
            about: mockedUser.about,
        };

        // call API to patch user details
        const response = await request.patch('/user/test').send(requestDto);
        expect(response.status).toBe(200);

        // find user with new username
        const user = await User.findOne({ username: mockedUser.username });
        expect(user).toMatchObject(requestDto);

        // reset username and email (for the purpose of further testing)
        assert(user !== null);
        await user.updateOne({ email: UserObject.email, username: UserObject.username }).exec();
    });

    // Tests for PATCH /user/:username/role

    it("Updating user's role to default and check if user's role is updated", async () => {
        const response = await request.patch('/user/test/role').send({
            role: IUserRole.Default,
        });
        expect(response.status).toBe(200);

        const user = await User.findOne({ username: 'test' });
        expect(user?.role).toBe(IUserRole.Default);
    });

    it("Updating user's role using default privilege and check if it fails", async () => {
        const response = await request.patch('/user/test/role').send({
            role: IUserRole.Administrator,
        });
        expect(response.status).toBe(401);
    });

    // Provile avatar tests

    // uploading a new file for profile picture is successfull
    it('should upload a new file for profile avatar', async () => {
        const avatarUpload = await request
            .post('/resource/upload/test')
            .attach('file', '__tests__/routes/users/logo.png');

        expect(avatarUpload.status).toBe(200);
    });

    // fails to accept upload of SVG avatar
    it('should fail to upload a SVG file for profile avatar', async () => {
        const avatarUpload = await request
            .post('/resource/upload/test')
            .attach('file', '__tests__/routes/users/logo.svg');

        expect(avatarUpload.status).toBe(400);
    });

    // TODO JG: Fail when file size too large
    it('should fail to upload files over 300Kb', async () => {
        const avatarUpload = await request
            .post('/resource/upload/test')
            .attach('file', '__tests__/routes/users/largeLogoFile.png');

        expect(avatarUpload.status).toBe(400);
    });

    // TODO JG: Fail when unauthorised
    // achieve by setting up new request as a different user
});

// delete the test user after all tests
it('should delete the test user', async () => {
    // call delete user api
    const deleteUserResponse = await request.delete('/user/test');

    // expect delete to be successful
    expect(deleteUserResponse.status).toBe(200);
});

// Deleting a user that's references as a collaborator in the database
// should clear it from the collaborators...
it('should delete collaborator references when user is deleted', async () => {
    // We want to create a user
    const owner = await new User({ ...createMockedUser() }).save();
    const collaborator = await new User({ ...createMockedUser() }).save();

    const ownerId = new mongoose.Types.ObjectId(owner._id);
    const collaboratorId = new mongoose.Types.ObjectId(collaborator._id);

    // Now let's create a publication with that user as being the collaborator
    const createdPublication = await new Publication({
        ...createMockedPublication({ owner: ownerId, collaborators: [collaboratorId] }),
    }).save();

    // Delete the user and verify that the publication has no collaborators
    await collaborator.delete();

    const publication = await Publication.findById(createdPublication._id.toString()).exec();
    expect(publication).not.toBeNull();
    expect(publication!.collaborators).toStrictEqual([]);
});
