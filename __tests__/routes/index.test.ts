import request from 'supertest';

import app from '../../src/app';
// import { createServer, Server } from "http";

describe('Server Litmus test', () => {
    // let server: Server;

    // beforeAll(done => {
    //     server = createServer(app);
    //     server.listen(done);
    // });

    // afterAll(done => {
    //     server.close(done);
    // });

    it('check that /version returns a status code of 200.', async () => {
        const response = await request(app).get('/version');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe(true);
    });
});
