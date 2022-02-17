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
  PatchComment,
  SuccessStatus
} from '.././models'

export const getGetThreadIdMock = () => ({status: faker.helpers.randomize(Object.values(SuccessStatus)), comments: [...Array(faker.datatype.number({min: 1, max: 10}))].map(() => ({id: faker.random.word(), edited: faker.datatype.boolean(), filename: faker.helpers.randomize([faker.random.word(), undefined]), anchor: faker.helpers.randomize([{start: faker.datatype.number(), end: faker.datatype.number()}, undefined]), contents: faker.random.word(), thread: faker.random.word(), review: faker.random.word(), replying: faker.helpers.randomize([faker.random.word(), undefined]), author: {id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), role: faker.helpers.randomize(['default','moderator','administrator']), name: faker.helpers.randomize([faker.random.word(), undefined]), createdAt: faker.datatype.number(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), status: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}, createdAt: faker.datatype.number(), updatedAt: faker.datatype.number()}))})

export const getGetCommentIdMock = () => ({status: faker.helpers.randomize(Object.values(SuccessStatus)), comment: faker.helpers.randomize([{id: faker.random.word(), edited: faker.datatype.boolean(), filename: faker.helpers.randomize([faker.random.word(), undefined]), anchor: faker.helpers.randomize([{start: faker.datatype.number(), end: faker.datatype.number()}, undefined]), contents: faker.random.word(), thread: faker.random.word(), review: faker.random.word(), replying: faker.helpers.randomize([faker.random.word(), undefined]), author: {id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), role: faker.helpers.randomize(['default','moderator','administrator']), name: faker.helpers.randomize([faker.random.word(), undefined]), createdAt: faker.datatype.number(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), status: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}, createdAt: faker.datatype.number(), updatedAt: faker.datatype.number()}, undefined])})

export const getPatchCommentIdMock = () => ({status: faker.helpers.randomize(Object.values(SuccessStatus)), comment: {id: faker.random.word(), edited: faker.datatype.boolean(), filename: faker.helpers.randomize([faker.random.word(), undefined]), anchor: faker.helpers.randomize([{start: faker.datatype.number(), end: faker.datatype.number()}, undefined]), contents: faker.random.word(), thread: faker.random.word(), review: faker.random.word(), replying: faker.helpers.randomize([faker.random.word(), undefined]), author: {id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), role: faker.helpers.randomize(['default','moderator','administrator']), name: faker.helpers.randomize([faker.random.word(), undefined]), createdAt: faker.datatype.number(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), status: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}, createdAt: faker.datatype.number(), updatedAt: faker.datatype.number()}})

export const getCommentsMSW = () => [
rest.get('*/thread/:id', (_req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getGetThreadIdMock()),
        )
      }),rest.delete('*/thread/:id', (_req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
        )
      }),rest.get('*/comment/:id', (_req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getGetCommentIdMock()),
        )
      }),rest.patch('*/comment/:id', (_req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getPatchCommentIdMock()),
        )
      }),rest.delete('*/comment/:id', (_req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
        )
      }),]
