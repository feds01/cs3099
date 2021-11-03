/**
 * Generated by orval v6.2.3 🍺
 * Do not edit manually.
 * Iamus API
 * This is a REST API for interfacing with Iamus. This API provides endpoints for interacting with user information, submissions, and reviews.
 * OpenAPI spec version: 1.0.0
 */
import { rest } from 'msw';

export const getResourcesMSW = () => [
    rest.post('*/resource/upload/:username', (req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'));
    }),
    rest.post('*/resource/upload/publication/:id', (req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'));
    }),
    rest.post('*/resource/upload/review/:id', (req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'));
    }),
];
