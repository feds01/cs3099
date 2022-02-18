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

export const getGetSearchPublicationMock = () => ({status: faker.helpers.randomize(Object.values(SuccessStatus)), publications: [...Array(faker.datatype.number({min: 1, max: 10}))].map(() => ({id: faker.random.word(), name: faker.random.word(), title: faker.random.word(), introduction: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined]), revision: faker.random.word(), pinned: faker.datatype.boolean(), draft: faker.datatype.boolean(), current: faker.datatype.boolean(), owner: {id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), role: faker.helpers.randomize(['default','moderator','administrator']), name: faker.helpers.randomize([faker.random.word(), undefined]), createdAt: faker.datatype.number(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), status: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}, attachment: faker.helpers.randomize([faker.datatype.boolean(), undefined]), collaborators: [...Array(faker.datatype.number({min: 1, max: 10}))].map(() => (faker.random.word())), createdAt: faker.datatype.number(), updatedAt: faker.datatype.number()}))})

export const getGetSearchUserMock = () => ({status: faker.helpers.randomize(Object.values(SuccessStatus)), users: [...Array(faker.datatype.number({min: 1, max: 10}))].map(() => ({id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), role: faker.helpers.randomize(['default','moderator','administrator']), name: faker.helpers.randomize([faker.random.word(), undefined]), createdAt: faker.datatype.number(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), status: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}))})

export const getSearchMSW = () => [
rest.get('*/search/publication', (_req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getGetSearchPublicationMock()),
        )
      }),rest.get('*/search/user', (_req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getGetSearchUserMock()),
        )
      }),]
