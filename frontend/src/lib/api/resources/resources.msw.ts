/**
 * Generated by orval v6.5.3 🍺
 * Do not edit manually.
 * Iamus API
 * This is a REST API for interfacing with Iamus. This API provides endpoints for interacting with user information, submissions, and reviews.
 * OpenAPI spec version: 1.0.0
 */
import {
  rest
} from 'msw'
import faker from 'faker'

export const getPostResourceUploadUsernameMock = () => ({status: faker.helpers.randomize(['ok'])})

export const getPostResourceUploadPublicationIdMock = () => ({status: faker.helpers.randomize(['ok'])})

export const getPostResourceUploadReviewIdMock = () => ({status: faker.helpers.randomize(['ok'])})

export const getResourcesMSW = () => [
rest.post('*/resource/upload/:username', (_req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getPostResourceUploadUsernameMock()),
        )
      }),rest.post('*/resource/upload/publication/:id', (_req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getPostResourceUploadPublicationIdMock()),
        )
      }),rest.post('*/resource/upload/review/:id', (_req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getPostResourceUploadReviewIdMock()),
        )
      }),]
