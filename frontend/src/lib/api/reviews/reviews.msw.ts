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

export const getPostPublicationUsernameNameReviewMock = () => ({status: faker.datatype.boolean(), review: {publication: {id: faker.random.word(), name: faker.random.word(), title: faker.random.word(), introduction: faker.helpers.randomize([faker.random.word(), undefined]), revision: faker.random.word(), pinned: faker.datatype.boolean(), draft: faker.datatype.boolean(), owner: {id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), firstName: faker.random.word(), lastName: faker.random.word(), createdAt: faker.datatype.number(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), status: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}, attachment: faker.helpers.randomize([faker.datatype.boolean(), undefined]), collaborators: [...Array(faker.datatype.number({min: 1, max: 10}))].map(() => (faker.random.word())), createdAt: faker.datatype.number(), updatedAt: faker.datatype.number()}, owner: {id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), firstName: faker.random.word(), lastName: faker.random.word(), createdAt: faker.datatype.number(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), status: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}, createdAt: faker.datatype.number(), updatedAt: faker.datatype.number(), id: faker.random.word()}})

export const getGetPublicationUsernameNameRevisionReviewsMock = () => ({status: faker.datatype.boolean(), reviews: [...Array(faker.datatype.number({min: 1, max: 10}))].map(() => ({publication: {id: faker.random.word(), name: faker.random.word(), title: faker.random.word(), introduction: faker.helpers.randomize([faker.random.word(), undefined]), revision: faker.random.word(), pinned: faker.datatype.boolean(), draft: faker.datatype.boolean(), owner: {id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), firstName: faker.random.word(), lastName: faker.random.word(), createdAt: faker.datatype.number(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), status: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}, attachment: faker.helpers.randomize([faker.datatype.boolean(), undefined]), collaborators: [...Array(faker.datatype.number({min: 1, max: 10}))].map(() => (faker.random.word())), createdAt: faker.datatype.number(), updatedAt: faker.datatype.number()}, owner: {id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), firstName: faker.random.word(), lastName: faker.random.word(), createdAt: faker.datatype.number(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), status: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}, createdAt: faker.datatype.number(), updatedAt: faker.datatype.number(), id: faker.random.word()}))})

export const getPostReviewIdCommentMock = () => ({status: faker.helpers.randomize(['ok']), comment: faker.helpers.randomize([{filename: faker.random.word(), anchor: faker.helpers.randomize([{start: faker.datatype.number(), end: faker.datatype.number()}, undefined]), contents: faker.random.word(), thread: faker.datatype.number(), author: {id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), firstName: faker.random.word(), lastName: faker.random.word(), createdAt: faker.datatype.number(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), status: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}, postedAt: faker.datatype.number()}, undefined])})

export const getGetReviewIdMock = () => ({status: faker.helpers.randomize(['ok']), review: faker.helpers.randomize([{publication: {id: faker.random.word(), name: faker.random.word(), title: faker.random.word(), introduction: faker.helpers.randomize([faker.random.word(), undefined]), revision: faker.random.word(), pinned: faker.datatype.boolean(), draft: faker.datatype.boolean(), owner: {id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), firstName: faker.random.word(), lastName: faker.random.word(), createdAt: faker.datatype.number(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), status: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}, attachment: faker.helpers.randomize([faker.datatype.boolean(), undefined]), collaborators: [...Array(faker.datatype.number({min: 1, max: 10}))].map(() => (faker.random.word())), createdAt: faker.datatype.number(), updatedAt: faker.datatype.number()}, owner: {id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), firstName: faker.random.word(), lastName: faker.random.word(), createdAt: faker.datatype.number(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), status: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}, createdAt: faker.datatype.number(), updatedAt: faker.datatype.number(), id: faker.random.word()}, undefined])})

export const getGetReviewIdCommentsMock = () => ({status: faker.helpers.randomize(['ok']), comments: faker.helpers.randomize([[...Array(faker.datatype.number({min: 1, max: 10}))].map(() => ({publication: {id: faker.random.word(), name: faker.random.word(), title: faker.random.word(), introduction: faker.helpers.randomize([faker.random.word(), undefined]), revision: faker.random.word(), pinned: faker.datatype.boolean(), draft: faker.datatype.boolean(), owner: {id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), firstName: faker.random.word(), lastName: faker.random.word(), createdAt: faker.datatype.number(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), status: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}, attachment: faker.helpers.randomize([faker.datatype.boolean(), undefined]), collaborators: [...Array(faker.datatype.number({min: 1, max: 10}))].map(() => (faker.random.word())), createdAt: faker.datatype.number(), updatedAt: faker.datatype.number()}, owner: {id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), firstName: faker.random.word(), lastName: faker.random.word(), createdAt: faker.datatype.number(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), status: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}, createdAt: faker.datatype.number(), updatedAt: faker.datatype.number(), id: faker.random.word()})), undefined])})

export const getReviewsMSW = () => [
rest.post('*/publication/:username/:name/review', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getPostPublicationUsernameNameReviewMock()),
        )
      }),rest.get('*/publication/:username/:name/:revision/reviews', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getGetPublicationUsernameNameRevisionReviewsMock()),
        )
      }),rest.post('*/review/:id/comment', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getPostReviewIdCommentMock()),
        )
      }),rest.get('*/review/:id', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getGetReviewIdMock()),
        )
      }),rest.delete('*/review/:id', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
        )
      }),rest.get('*/review/:id/comments', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getGetReviewIdCommentsMock()),
        )
      }),rest.post('*/review/:id/complete', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
        )
      }),]
