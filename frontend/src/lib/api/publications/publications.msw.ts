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

export const getPostPublicationMock = () => ({status: faker.helpers.randomize(['ok']), publication: {id: faker.random.word(), name: faker.random.word(), title: faker.random.word(), introduction: faker.helpers.randomize([faker.random.word(), undefined]), revision: faker.random.word(), pinned: faker.datatype.boolean(), draft: faker.datatype.boolean(), owner: {id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), firstName: faker.random.word(), lastName: faker.random.word(), createdAt: faker.datatype.number(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), status: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}, attachment: faker.helpers.randomize([faker.datatype.boolean(), undefined]), collaborators: [...Array(faker.datatype.number({min: 1, max: 10}))].map(() => (faker.random.word())), createdAt: faker.datatype.number(), updatedAt: faker.datatype.number()}})

export const getDeletePublicationUsernameNameMock = () => ({status: faker.helpers.randomize(['ok']), message: faker.random.word()})

export const getGetPublicationUsernameNameMock = () => ({status: faker.helpers.randomize(['ok']), publication: {id: faker.random.word(), name: faker.random.word(), title: faker.random.word(), introduction: faker.helpers.randomize([faker.random.word(), undefined]), revision: faker.random.word(), pinned: faker.datatype.boolean(), draft: faker.datatype.boolean(), owner: {id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), firstName: faker.random.word(), lastName: faker.random.word(), createdAt: faker.datatype.number(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), status: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}, attachment: faker.helpers.randomize([faker.datatype.boolean(), undefined]), collaborators: [...Array(faker.datatype.number({min: 1, max: 10}))].map(() => (faker.random.word())), createdAt: faker.datatype.number(), updatedAt: faker.datatype.number()}})

export const getGetPublicationUsernameMock = () => ({status: faker.helpers.randomize(['ok']), data: [...Array(faker.datatype.number({min: 1, max: 10}))].map(() => ({id: faker.random.word(), name: faker.random.word(), title: faker.random.word(), introduction: faker.helpers.randomize([faker.random.word(), undefined]), revision: faker.random.word(), pinned: faker.datatype.boolean(), draft: faker.datatype.boolean(), owner: {id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), firstName: faker.random.word(), lastName: faker.random.word(), createdAt: faker.datatype.number(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), status: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}, attachment: faker.helpers.randomize([faker.datatype.boolean(), undefined]), collaborators: [...Array(faker.datatype.number({min: 1, max: 10}))].map(() => (faker.random.word())), createdAt: faker.datatype.number(), updatedAt: faker.datatype.number()}))})

export const getGetPublicationUsernameNameRevisionsMock = () => ({status: faker.datatype.boolean(), data: {revisions: [...Array(faker.datatype.number({min: 1, max: 10}))].map(() => ({id: faker.random.word(), name: faker.random.word(), title: faker.random.word(), introduction: faker.helpers.randomize([faker.random.word(), undefined]), revision: faker.random.word(), pinned: faker.datatype.boolean(), draft: faker.datatype.boolean(), owner: {id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), firstName: faker.random.word(), lastName: faker.random.word(), createdAt: faker.datatype.number(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), status: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}, attachment: faker.helpers.randomize([faker.datatype.boolean(), undefined]), collaborators: [...Array(faker.datatype.number({min: 1, max: 10}))].map(() => (faker.random.word())), createdAt: faker.datatype.number(), updatedAt: faker.datatype.number()}))}})

export const getGetPublicationUsernameNameTreePathMock = () => ({status: faker.helpers.randomize(['ok']), data: faker.helpers.randomize([{type: faker.helpers.randomize(['file']), filename: faker.helpers.randomize([faker.random.word(), undefined]), contents: faker.random.word(), updatedAt: faker.datatype.number()},{type: faker.helpers.randomize(['directory']), entries: [...Array(faker.datatype.number({min: 1, max: 10}))].map(() => ({type: faker.random.word(), filename: faker.random.word(), updatedAt: faker.datatype.number()}))}])})

export const getDeletePublicationUsernameNameRevisionMock = () => ({status: faker.helpers.randomize(['ok']), message: faker.random.word()})

export const getGetPublicationUsernameNameRevisionMock = () => ({status: faker.helpers.randomize(['ok']), publication: {id: faker.random.word(), name: faker.random.word(), title: faker.random.word(), introduction: faker.helpers.randomize([faker.random.word(), undefined]), revision: faker.random.word(), pinned: faker.datatype.boolean(), draft: faker.datatype.boolean(), owner: {id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), firstName: faker.random.word(), lastName: faker.random.word(), createdAt: faker.datatype.number(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), status: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}, attachment: faker.helpers.randomize([faker.datatype.boolean(), undefined]), collaborators: [...Array(faker.datatype.number({min: 1, max: 10}))].map(() => (faker.random.word())), createdAt: faker.datatype.number(), updatedAt: faker.datatype.number()}})

export const getGetPublicationUsernameNameRevisionTreePathMock = () => ({status: faker.helpers.randomize(['ok']), data: faker.helpers.randomize([{type: faker.helpers.randomize(['file']), filename: faker.helpers.randomize([faker.random.word(), undefined]), contents: faker.random.word(), updatedAt: faker.datatype.number()},{type: faker.helpers.randomize(['directory']), entries: [...Array(faker.datatype.number({min: 1, max: 10}))].map(() => ({type: faker.random.word(), filename: faker.random.word(), updatedAt: faker.datatype.number()}))}])})

export const getGetPublicationUsernameNameRevisionAllMock = () => ({status: faker.helpers.randomize(['ok']), files: [...Array(faker.datatype.number({min: 1, max: 10}))].map(() => ({type: faker.helpers.randomize(['file']), filename: faker.helpers.randomize([faker.random.word(), undefined]), contents: faker.random.word(), updatedAt: faker.datatype.number()}))})

export const getPublicationsMSW = () => [
rest.post('*/publication', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getPostPublicationMock()),
        )
      }),rest.delete('*/publication/:username/:name', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getDeletePublicationUsernameNameMock()),
        )
      }),rest.get('*/publication/:username/:name', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getGetPublicationUsernameNameMock()),
        )
      }),rest.get('*/publication/:username', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getGetPublicationUsernameMock()),
        )
      }),rest.get('*/publication/:username/:name/revisions', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getGetPublicationUsernameNameRevisionsMock()),
        )
      }),rest.get('*/publication/:username/:name/tree/:path', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getGetPublicationUsernameNameTreePathMock()),
        )
      }),rest.delete('*/publication/:username/:name/:revision', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getDeletePublicationUsernameNameRevisionMock()),
        )
      }),rest.get('*/publication/:username/:name/:revision', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getGetPublicationUsernameNameRevisionMock()),
        )
      }),rest.get('*/publication/:username/:name/:revision/tree/:path', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getGetPublicationUsernameNameRevisionTreePathMock()),
        )
      }),rest.get('*/publication/:username/:name/:revision/all', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getGetPublicationUsernameNameRevisionAllMock()),
        )
      }),rest.post('*/publication/:username/:name/:revision/export', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
        )
      }),]
