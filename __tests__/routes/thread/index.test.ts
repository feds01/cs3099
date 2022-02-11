import app from '../../../src/app';
import { agent as supertest } from 'supertest';

const request = supertest(app);

// TODO: write tests for thread endpoints
describe('Thread endpoints testing', () => {
    it('Test placeholder', () => {
        expect(request).toBeDefined();
    });
});
