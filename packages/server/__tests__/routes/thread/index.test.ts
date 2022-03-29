import { describe, expect, it } from '@jest/globals';
import { agent as supertest } from 'supertest';

import app from '../../../src/app';

const request = supertest(app);

// TODO: write tests for thread endpoints
describe('Thread endpoints testing', () => {
    it('Test placeholder', () => {
        expect(request).toBeDefined();
    });
});

/* TODO:

 - Add comment to someone else's review (hence making a thread)
 - Test what happens when a top level comment is deleted
 - Mod/Admin abilities to edit/ delete a thread

*/
