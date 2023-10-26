import '@testing-library/jest-dom';
import { setupServer } from 'msw/node';
import { getUsersMSW } from './lib/api/users/users.msw';
import { getReviewsMSW } from './lib/api/reviews/reviews.msw';
import { getCommentsMSW } from './lib/api/comments/comments.msw';
import { getPublicationsMSW } from './lib/api/publications/publications.msw';

/**
 * Mock remark-github and friends since they use ESM and this isn't currently
 * working in Webpack 5
 */
jest.mock('react-markdown', () => (props: { children: React.ReactChildren }) => {
    return <>{props.children}</>;
});
jest.mock('remark-gfm', () => () => {});
jest.mock('remark-github', () => () => {});
jest.mock('remark-math', () => () => {});
jest.mock('rehype-katex', () => () => {});

/**
 * Setup request mock server
 */
const server = setupServer(...getCommentsMSW(), ...getReviewsMSW(), ...getUsersMSW(), ...getPublicationsMSW());

// Enable API mocking before tests.
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests.
afterEach(() => server.resetHandlers());

// Disable API mocking after the tests are done.
afterAll(() => server.close());
