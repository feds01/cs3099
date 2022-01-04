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

export const getGetThreadIdMock = () => ({status: faker.helpers.randomize(['ok']), comments: [...Array(faker.datatype.number({min: 1, max: 10}))].map(() => ({filename: faker.random.word(), anchor: faker.helpers.randomize([{start: faker.datatype.number(), end: faker.datatype.number()}, undefined]), contents: faker.random.word(), thread: faker.datatype.number(), author: {id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), firstName: faker.random.word(), lastName: faker.random.word(), createdAt: faker.datatype.number(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), status: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}, createdAt: faker.datatype.number(), updatedAt: faker.datatype.number()}))})

export const getGetCommentIdMock = () => ({status: faker.helpers.randomize(['ok']), comment: faker.helpers.randomize([{filename: faker.random.word(), anchor: faker.helpers.randomize([{start: faker.datatype.number(), end: faker.datatype.number()}, undefined]), contents: faker.random.word(), thread: faker.datatype.number(), author: {id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), firstName: faker.random.word(), lastName: faker.random.word(), createdAt: faker.datatype.number(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), status: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}, createdAt: faker.datatype.number(), updatedAt: faker.datatype.number()}, undefined])})

export const getCommentsMSW = () => [
rest.get('*/thread/:id', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getGetThreadIdMock()),
        )
      }),rest.delete('*/thread/:id', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
        )
      }),rest.get('*/comment/:id', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getGetCommentIdMock()),
        )
      }),rest.delete('*/comment/:id', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
        )
      }),]
