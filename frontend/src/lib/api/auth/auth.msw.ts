/**
 * Generated by orval v6.2.3 🍺
 * Do not edit manually.
 * Iamus API
 * This is a REST API for interfacing with Iamus. This API provides endpoints for interacting with user information, submissions, and reviews.
 * OpenAPI spec version: 1.0.0
 */
import {
  rest
} from 'msw'
import faker from 'faker'

export const getPostAuthTokenMock = () => ({status: faker.datatype.boolean(), token: faker.random.word(), refreshToken: faker.random.word()})

export const getPostAuthLoginMock = () => ({status: faker.helpers.randomize([faker.datatype.boolean(), undefined]), token: faker.random.word(), refreshToken: faker.random.word(), user: {id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), firstName: faker.random.word(), lastName: faker.random.word(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}})

export const getPostAuthRegisterMock = () => ({status: faker.helpers.randomize([faker.datatype.boolean(), undefined]), token: faker.random.word(), refreshToken: faker.random.word(), user: {id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), firstName: faker.random.word(), lastName: faker.random.word(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}})

export const getAuthMSW = () => [
rest.post('*/auth/email_validation', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
        )
      }),rest.post('*/auth/username_validation', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
        )
      }),rest.post('*/auth/token', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getPostAuthTokenMock()),
        )
      }),rest.post('*/auth/login', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getPostAuthLoginMock()),
        )
      }),rest.post('*/auth/register', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getPostAuthRegisterMock()),
        )
      }),]
