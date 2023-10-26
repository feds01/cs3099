import { beforeAll, describe, expect, it } from '@jest/globals';
import { agent as supertest } from 'supertest';

import app from '../../../src/app';
import { CODES } from '../../../src/common/errors';
import { createMockedUser } from '../../utils/factories/user';
import { registerUserAndAuthenticate } from '../../utils/requests/createUser';

const request = supertest(app);

// Profile avatar tests
describe('Profile avatar tests', () => {
    const requester = createMockedUser({
        email: 'test@email.com',
        username: 'test',
        name: 'test',
        about: 'Nothing to say',
    });

    /** Create a user test account before any test is run */
    beforeAll(async () => {
        const requesterResponse = await registerUserAndAuthenticate(request, requester);

        request.auth(requesterResponse.token, { type: 'bearer' });
        request.set({ 'x-refresh-token': requesterResponse.refreshToken });
    });

    // uploading a new file for profile picture is successful
    it('should upload a new file for profile avatar', async () => {
        const avatarUpload = await request
            .post('/resource/upload/test')
            .attach('file', '__tests__/resources/logo.png');

        expect(avatarUpload.status).toBe(200);
    });

    // fails to accept upload of SVG avatar
    it('should fail to upload a SVG file for profile avatar', async () => {
        const avatarUpload = await request
            .post('/resource/upload/test')
            .attach('file', '__tests__/resources/logo.svg');

        expect(avatarUpload.status).toBe(400);
    });

    // Fail when file size too large
    it('should fail to upload files over 300Kb', async () => {
        const avatarUpload = await request
            .post('/resource/upload/test')
            .attach('file', '__tests__/resources/largeLogoFile.png');

        expect(avatarUpload.status).toBe(413);
        expect(avatarUpload.body.errors).toHaveProperty('file');
        expect(avatarUpload.body.errors.file.code).toBe(CODES.RESOURCE_UPLOAD_TOO_LARGE);
    });
});
