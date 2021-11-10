import { agent as supertest } from 'supertest';
import app from '../../../src/app';

const request = supertest(app);

// TODO: write tests for thread endpoints
describe('Thread endpoints testing', () => {
    it('Test placeholder', () => {
        expect(request).toBeDefined();
    });
});
