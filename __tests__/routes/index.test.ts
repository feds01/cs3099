import request from 'supertest';
import app from '../../src/app';

describe('Server Litmus test', () => {
    it('check that /version returns a status code of 200.', async () => {
        const response = await request(app).get('/version');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ok');
    });
});
