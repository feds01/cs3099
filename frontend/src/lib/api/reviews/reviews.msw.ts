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

export const getPostPublicationUsernameNameRevisionReviewMock = () => ({status: faker.helpers.randomize(Object.values(SuccessStatus)), review: {publication: {id: faker.random.word(), name: faker.random.word(), title: faker.random.word(), introduction: faker.helpers.randomize([faker.random.word(), undefined]), revision: faker.random.word(), pinned: faker.datatype.boolean(), draft: faker.datatype.boolean(), current: faker.datatype.boolean(), owner: {id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), name: faker.helpers.randomize([faker.random.word(), undefined]), createdAt: faker.datatype.number(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), status: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}, attachment: faker.helpers.randomize([faker.datatype.boolean(), undefined]), collaborators: [...Array(faker.datatype.number({min: 1, max: 10}))].map(() => (faker.random.word())), createdAt: faker.datatype.number(), updatedAt: faker.datatype.number()}, owner: {id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), name: faker.helpers.randomize([faker.random.word(), undefined]), createdAt: faker.datatype.number(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), status: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}, createdAt: faker.datatype.number(), updatedAt: faker.datatype.number(), status: faker.helpers.randomize(['started','completed']), id: faker.random.word()}})

export const getGetPublicationUsernameNameRevisionReviewsMock = () => ({status: faker.helpers.randomize(Object.values(SuccessStatus)), reviews: [...Array(faker.datatype.number({min: 1, max: 10}))].map(() => ({publication: {id: faker.random.word(), name: faker.random.word(), title: faker.random.word(), introduction: faker.helpers.randomize([faker.random.word(), undefined]), revision: faker.random.word(), pinned: faker.datatype.boolean(), draft: faker.datatype.boolean(), current: faker.datatype.boolean(), owner: {id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), name: faker.helpers.randomize([faker.random.word(), undefined]), createdAt: faker.datatype.number(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), status: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}, attachment: faker.helpers.randomize([faker.datatype.boolean(), undefined]), collaborators: [...Array(faker.datatype.number({min: 1, max: 10}))].map(() => (faker.random.word())), createdAt: faker.datatype.number(), updatedAt: faker.datatype.number()}, owner: {id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), name: faker.helpers.randomize([faker.random.word(), undefined]), createdAt: faker.datatype.number(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), status: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}, createdAt: faker.datatype.number(), updatedAt: faker.datatype.number(), status: faker.helpers.randomize(['started','completed']), id: faker.random.word()}))})

export const getPutReviewIdCommentMock = () => ({status: faker.helpers.randomize(Object.values(SuccessStatus)), comment: {id: faker.random.word(), edited: faker.datatype.boolean(), filename: faker.helpers.randomize([faker.random.word(), undefined]), anchor: faker.helpers.randomize([{start: faker.datatype.number(), end: faker.datatype.number()}, undefined]), contents: faker.random.word(), thread: faker.random.word(), review: faker.random.word(), replying: faker.helpers.randomize([faker.random.word(), undefined]), author: {id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), name: faker.helpers.randomize([faker.random.word(), undefined]), createdAt: faker.datatype.number(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), status: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}, createdAt: faker.datatype.number(), updatedAt: faker.datatype.number()}})

export const getGetReviewIdMock = () => ({status: faker.helpers.randomize(Object.values(SuccessStatus)), review: {publication: {id: faker.random.word(), name: faker.random.word(), title: faker.random.word(), introduction: faker.helpers.randomize([faker.random.word(), undefined]), revision: faker.random.word(), pinned: faker.datatype.boolean(), draft: faker.datatype.boolean(), current: faker.datatype.boolean(), owner: {id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), name: faker.helpers.randomize([faker.random.word(), undefined]), createdAt: faker.datatype.number(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), status: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}, attachment: faker.helpers.randomize([faker.datatype.boolean(), undefined]), collaborators: [...Array(faker.datatype.number({min: 1, max: 10}))].map(() => (faker.random.word())), createdAt: faker.datatype.number(), updatedAt: faker.datatype.number()}, owner: {id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), name: faker.helpers.randomize([faker.random.word(), undefined]), createdAt: faker.datatype.number(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), status: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}, createdAt: faker.datatype.number(), updatedAt: faker.datatype.number(), status: faker.helpers.randomize(['started','completed']), id: faker.random.word()}})

export const getGetReviewIdCommentsMock = () => ({status: faker.helpers.randomize(Object.values(SuccessStatus)), comments: [...Array(faker.datatype.number({min: 1, max: 10}))].map(() => ({id: faker.random.word(), edited: faker.datatype.boolean(), filename: faker.helpers.randomize([faker.random.word(), undefined]), anchor: faker.helpers.randomize([{start: faker.datatype.number(), end: faker.datatype.number()}, undefined]), contents: faker.random.word(), thread: faker.random.word(), review: faker.random.word(), replying: faker.helpers.randomize([faker.random.word(), undefined]), author: {id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), name: faker.helpers.randomize([faker.random.word(), undefined]), createdAt: faker.datatype.number(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), status: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}, createdAt: faker.datatype.number(), updatedAt: faker.datatype.number()}))})

export const getReviewsMSW = () => [
rest.post('*/publication/:username/:name/:revision/review', (_req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getPostPublicationUsernameNameRevisionReviewMock()),
        )
      }),rest.get('*/publication/:username/:name/:revision/reviews', (_req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getGetPublicationUsernameNameRevisionReviewsMock()),
        )
      }),rest.put('*/review/:id/comment', (_req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getPutReviewIdCommentMock()),
        )
      }),rest.get('*/review/:id', (_req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getGetReviewIdMock()),
        )
      }),rest.delete('*/review/:id', (_req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
        )
      }),rest.get('*/review/:id/comments', (_req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getGetReviewIdCommentsMock()),
        )
      }),rest.post('*/review/:id/complete', (_req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
        )
      }),]
