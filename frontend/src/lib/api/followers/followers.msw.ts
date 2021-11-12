/**
 * Generated by orval v6.2.3 🍺
 * Do not edit manually.
 * Iamus API
 * This is a REST API for interfacing with Iamus. This API provides endpoints for interacting with user information, submissions, and reviews.
 * OpenAPI spec version: 1.0.0
 */
import { rest } from 'msw';
import faker from 'faker';

export const getGetUserUsernameFollowMock = () => ({
    status: faker.helpers.randomize(['ok']),
    following: faker.datatype.boolean(),
});

export const getGetUserUsernameFollowersMock = () => ({
    status: faker.helpers.randomize(['ok']),
    data: {
        followers: [...Array(faker.datatype.number({ min: 1, max: 10 }))].map(() => ({
            id: faker.random.word(),
            email: faker.random.word(),
            username: faker.random.word(),
            firstName: faker.random.word(),
            lastName: faker.random.word(),
            createdAt: faker.datatype.number(),
            profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]),
            status: faker.helpers.randomize([faker.random.word(), undefined]),
            about: faker.helpers.randomize([faker.random.word(), undefined]),
        })),
    },
});

export const getGetUserUsernameFollowingMock = () => ({
    status: faker.helpers.randomize(['ok']),
    data: {
        following: [...Array(faker.datatype.number({ min: 1, max: 10 }))].map(() => ({
            id: faker.random.word(),
            email: faker.random.word(),
            username: faker.random.word(),
            firstName: faker.random.word(),
            lastName: faker.random.word(),
            createdAt: faker.datatype.number(),
            profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]),
            status: faker.helpers.randomize([faker.random.word(), undefined]),
            about: faker.helpers.randomize([faker.random.word(), undefined]),
        })),
    },
});

export const getFollowersMSW = () => [
    rest.get('*/user/:username/follow', (req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'), ctx.json(getGetUserUsernameFollowMock()));
    }),
    rest.get('*/user/:username/followers', (req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'), ctx.json(getGetUserUsernameFollowersMock()));
    }),
    rest.get('*/user/:username/following', (req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'), ctx.json(getGetUserUsernameFollowingMock()));
    }),
];
