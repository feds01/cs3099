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

export const getGetPublicationUsernameNameBookmarkMock = () => ({status: faker.datatype.boolean(), bookmarked: faker.datatype.boolean()})

export const getGetPublicationUsernameNameBookmarkersMock = () => ({status: faker.helpers.randomize(['ok']), bookmarks: [...Array(faker.datatype.number({min: 1, max: 10}))].map(() => ({id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), firstName: faker.random.word(), lastName: faker.random.word(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), status: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}))})

export const getGetPublicationUsernameBookmarksMock = () => ({status: faker.helpers.randomize(['ok']), bookmarked: faker.helpers.randomize([[...Array(faker.datatype.number({min: 1, max: 10}))].map(() => ({name: faker.random.word(), title: faker.random.word(), introduction: faker.random.word(), revision: faker.random.word(), draft: faker.datatype.boolean(), owner: {id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), firstName: faker.random.word(), lastName: faker.random.word(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), status: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}, collaborators: [...Array(faker.datatype.number({min: 1, max: 10}))].map(() => (faker.random.word()))})), undefined])})

export const getBookmarksMSW = () => [
rest.delete('*/publication/:username/:name/bookmark', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
        )
      }),rest.get('*/publication/:username/:name/bookmark', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getGetPublicationUsernameNameBookmarkMock()),
        )
      }),rest.post('*/publication/:username/:name/bookmark', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
        )
      }),rest.get('*/publication/:username/:name/bookmarkers', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getGetPublicationUsernameNameBookmarkersMock()),
        )
      }),rest.get('*/publication/:username/bookmarks', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getGetPublicationUsernameBookmarksMock()),
        )
      }),]
