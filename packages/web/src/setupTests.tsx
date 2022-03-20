// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import { getCommentsMSW } from './lib/api/comments/comments.msw';
import { getPublicationsMSW } from './lib/api/publications/publications.msw';
import { getReviewsMSW } from './lib/api/reviews/reviews.msw';
import { getUsersMSW } from './lib/api/users/users.msw';
import '@testing-library/jest-dom';

import { setupServer } from 'msw/node';

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
