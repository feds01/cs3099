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
import type {
  UserLogin
} from '.././models'

export const getPostUserLoginMock = () => ({status: faker.helpers.randomize([faker.datatype.boolean(), undefined]), token: faker.random.word(), refreshToken: faker.random.word(), user: {id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), firstName: faker.random.word(), lastName: faker.random.word(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}})

export const getPostUserRegisterMock = () => ({status: faker.helpers.randomize([faker.datatype.boolean(), undefined]), token: faker.random.word(), refreshToken: faker.random.word(), user: {id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), firstName: faker.random.word(), lastName: faker.random.word(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}})

export const getDeleteUserIdMock = () => ({status: faker.helpers.randomize([faker.datatype.boolean(), undefined]), description: faker.helpers.randomize([faker.random.word(), undefined])})

export const getGetUserIdMock = () => ({status: faker.helpers.randomize([faker.datatype.boolean(), undefined]), user: faker.helpers.randomize([{id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), firstName: faker.random.word(), lastName: faker.random.word(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}, undefined])})

export const getPatchUserIdMock = () => ({status: faker.helpers.randomize([faker.datatype.boolean(), undefined]), user: faker.helpers.randomize([{id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), firstName: faker.random.word(), lastName: faker.random.word(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])}, undefined])})

export const getGetUserIdRoleMock = () => ({status: faker.helpers.randomize([faker.datatype.boolean(), undefined]), role: faker.helpers.randomize([faker.random.word(), undefined])})

export const getPatchUserIdRoleMock = () => ({status: faker.helpers.randomize([faker.datatype.boolean(), undefined]), message: faker.helpers.randomize([faker.random.word(), undefined]), role: faker.helpers.randomize([faker.random.word(), undefined])})

export const getGetUserIdFollowMock = () => ({status: faker.helpers.randomize([faker.datatype.boolean(), undefined]), following: faker.helpers.randomize([faker.datatype.boolean(), undefined]), message: faker.helpers.randomize([faker.random.word(), undefined])})

export const getPostUserIdFollowMock = () => ({status: faker.helpers.randomize([faker.datatype.boolean(), undefined]), message: faker.helpers.randomize([faker.random.word(), undefined])})

export const getDeleteUserIdFollowMock = () => ({status: faker.helpers.randomize([faker.datatype.boolean(), undefined]), message: faker.helpers.randomize([faker.random.word(), undefined])})

export const getGetUserIdFollowersMock = () => ({status: faker.helpers.randomize([faker.datatype.boolean(), undefined]), data: faker.helpers.randomize([{followers: faker.helpers.randomize([[...Array(faker.datatype.number({min: 1, max: 10}))].map(() => ({id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), firstName: faker.random.word(), lastName: faker.random.word(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])})), undefined])}, undefined])})

export const getGetUserIdFollowingMock = () => ({status: faker.helpers.randomize([faker.datatype.boolean(), undefined]), data: faker.helpers.randomize([{following: faker.helpers.randomize([[...Array(faker.datatype.number({min: 1, max: 10}))].map(() => ({id: faker.random.word(), email: faker.random.word(), username: faker.random.word(), firstName: faker.random.word(), lastName: faker.random.word(), profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]), about: faker.helpers.randomize([faker.random.word(), undefined])})), undefined])}, undefined])})

export const getUsersMSW = () => [
rest.post('*/user/login', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getPostUserLoginMock()),
        )
      }),rest.post('*/user/register', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getPostUserRegisterMock()),
        )
      }),rest.delete('*/user/:id', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getDeleteUserIdMock()),
        )
      }),rest.get('*/user/:id', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getGetUserIdMock()),
        )
      }),rest.patch('*/user/:id', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getPatchUserIdMock()),
        )
      }),rest.get('*/user/:id/role', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getGetUserIdRoleMock()),
        )
      }),rest.patch('*/user/:id/role', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getPatchUserIdRoleMock()),
        )
      }),rest.get('*/user/:id/follow', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getGetUserIdFollowMock()),
        )
      }),rest.post('*/user/:id/follow', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getPostUserIdFollowMock()),
        )
      }),rest.delete('*/user/:id/follow', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getDeleteUserIdFollowMock()),
        )
      }),rest.get('*/user/:id/followers', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getGetUserIdFollowersMock()),
        )
      }),rest.get('*/user/:id/following', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200, 'Mocked status'),
ctx.json(getGetUserIdFollowingMock()),
        )
      }),]
