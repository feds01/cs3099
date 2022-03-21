//import assert from 'assert';
import { agent as supertest } from 'supertest';

import app from '../../../src/app';
//import Publication from '../../../src/models/Publication';
import User, {IUserRole } from '../../../src/models/User';
//import User from '../../../src/models/User';
import { createMockedUser } from '../../utils/factories/user';


const request = supertest(app);

//type PopulatedUserDocument = IUserDocument & { _id: string | undefined };

describe('Publication role tests', () => {
    const UserObject = {
        email: 'test@email.com',
        username: 'test',
        name: 'test',
        password: 'password',
        about: 'Nothing to say',
    };

    // Test account that will be used as the requester
    const userDto = createMockedUser({ username: 'a-user' });

    // Create a user test account before any test is run
    beforeEach(async () => {
        // Register a main user (ie author of publications)
        const registerResponse = await request.post('/auth/register').send(UserObject);
        expect(registerResponse.status).toBe(201);

        // Login as user
        const loginUser = await request.post('/auth/login').send({
            username: UserObject.username,
            password: UserObject.password,
        });

        expect(loginUser.status).toBe(200);
    
        // Create publication as main user
        const response = await request
        .post('/publication/')
        .auth(loginUser.body.token, { type: 'bearer' })
        .send({
            revision: 'v1',
            title: 'Publication Test',
            name: 'Publication-Test',
            introduction: 'Introduction here',
            collaborators: [],
        });

        expect(response.status).toBe(201);

        // Register an 'other' user
        const registerOther = await request.post('/auth/register').send(userDto);
        expect(registerOther.status).toBe(201);

        // Login as 'other' user
        const loginOtherUser = await request.post('/auth/login').send({
            username: userDto.username,
            password: userDto.password,
        });

        expect(loginOtherUser.status).toBe(200);

        // Save auth header
        request.auth(loginOtherUser.body.token, { type: 'bearer' });
        request.set({ 'x-refresh-token': loginOtherUser.body.refreshToken });
    });

    afterEach(async () => {
        // Sign into userDto (as an admin), delete both accounts created for testing
        const loginOther = await request.post('/auth/login').send({
            username: userDto.username,
            password: userDto.password,
        });

        expect(loginOther.status).toBe(200);

        await User.findOneAndUpdate(
            { username: userDto.username },
            { role: IUserRole.Administrator },
        );

        const registerResponse = await request.delete(`/user/${UserObject.username}`);
        expect(registerResponse.status).toBe(200);

        const registerOther = await request.delete(`/user/${userDto.username}`);
        expect(registerOther.status).toBe(200);
    });

    it('should handle unauthorised publication edit request', async () => {
        // Send patch request
        const responsePatch = await request
            .patch(`/publication/test/Publication-Test`)
            .send({
                revision: 'v2',
                title: 'Source Code Test',
                name: 'Source-Code-Test',
                introduction: 'New intro',
                collaborators: ['collabo1', 'collabo2'],
        });

        // Expect patch request to fail
        expect(responsePatch.status).toBe(400);

    });

    it('moderator can edit publication details', async () => {
        // Make 'other' user a moderator
        await User.findOneAndUpdate(
            { username: userDto.username },
            { role: IUserRole.Moderator },
        );

        // Send patch request
        const responsePatch = await request
            .patch(`/publication/test/Publication-Test`)
            .send({
                revision: 'v2',
                title: 'Source Code Test',
                name: 'Source-Code-Test',
                introduction: 'New intro',
                collaborators: [],
        });

        //Expect patch request to succeed
        expect(responsePatch.status).toBe(200);
        //expect(responsePatch.body).toBeNull();

    });

    it('administrator can edit publication details', async () => {
        // Make 'other' user an admin
        await User.findOneAndUpdate(
            { username: userDto.username },
            { role: IUserRole.Administrator },
        );

        // Send patch request
        const responsePatch = await request
            .patch(`/publication/test/Publication-Test`)
            .send({
                revision: 'v2',
                title: 'Source Code Test',
                name: 'Source-Code-Test',
                introduction: 'New intro',
                collaborators: [],
        });

        // Expect patch request to succeed
        expect(responsePatch.status).toBe(200);

    });

    it('should handle unauthorised publication delete request', async () => {
        // Send patch request
        const responsePatch = await request.delete(`/publication/test/Publication-Test`);

        // Expect patch request to fail
        expect(responsePatch.status).toBe(401);

    });

    it('moderator unable to delete publication', async () => {
       // Make 'other' user a moderator
        await User.findOneAndUpdate(
            { username: userDto.username },
            { role: IUserRole.Moderator },
        );

        // Send patch request
        const responsePatch = await request.delete(`/publication/test/Publication-Test`);

        // Expect patch request to succeed
        expect(responsePatch.status).toBe(401);

    });

    it('administrator can delete publication', async () => {
        // Make 'other' user a moderator
         await User.findOneAndUpdate(
             { username: userDto.username },
             { role: IUserRole.Administrator },
         );
 
         // Send patch request
         const responsePatch = await request.delete(`/publication/test/Publication-Test`);
 
         // Expect patch request to succeed
         expect(responsePatch.status).toBe(200);
 
     });

});