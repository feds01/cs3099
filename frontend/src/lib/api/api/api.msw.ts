/**
 * Generated by orval v6.6.0 🍺
 * Do not edit manually.
 * Iamus API
 * This is a REST API for interfacing with Iamus. This API provides endpoints for interacting with user information, submissions, and reviews.
 * OpenAPI spec version: 1.0.0
 */
import {
  rest
} from 'msw'
import faker from 'faker'
import {
  SuccessStatus
} from '.././models'

export const getGetVersionMock = () => ({status: faker.helpers.randomize(Object.values(SuccessStatus)), version: faker.random.word()})

export const getGetOpenapiMock = () => ({status: faker.helpers.randomize(Object.values(SuccessStatus)), schema: {}})

export const getApiMSW = () => [
rest.get('*/version', (_req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getGetVersionMock()),
        )
      }),rest.get('*/openapi', (_req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getGetOpenapiMock()),
        )
      }),]
