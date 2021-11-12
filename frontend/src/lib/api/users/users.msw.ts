/**
 * Generated by orval v6.2.3 🍺
 * Do not edit manually.
 * Iamus API
 * This is a REST API for interfacing with Iamus. This API provides endpoints for interacting with user information, submissions, and reviews.
 * OpenAPI spec version: 1.0.0
 */
import { rest } from 'msw';
import faker from 'faker';

export const getDeleteUserUsernameMock = () => ({
    status: faker.helpers.randomize([faker.helpers.randomize(['ok']), undefined]),
    description: faker.helpers.randomize([faker.random.word(), undefined]),
});

export const getGetUserUsernameMock = () => ({
    status: faker.helpers.randomize(['ok']),
    user: {
        id: faker.random.word(),
        email: faker.random.word(),
        username: faker.random.word(),
        firstName: faker.random.word(),
        lastName: faker.random.word(),
        createdAt: faker.datatype.number(),
        profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]),
        status: faker.helpers.randomize([faker.random.word(), undefined]),
        about: faker.helpers.randomize([faker.random.word(), undefined]),
    },
    follows: { followers: faker.datatype.number(), following: faker.datatype.number() },
});

export const getPatchUserUsernameMock = () => ({
    status: faker.helpers.randomize(['ok']),
    user: {
        id: faker.random.word(),
        email: faker.random.word(),
        username: faker.random.word(),
        firstName: faker.random.word(),
        lastName: faker.random.word(),
        createdAt: faker.datatype.number(),
        profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]),
        status: faker.helpers.randomize([faker.random.word(), undefined]),
        about: faker.helpers.randomize([faker.random.word(), undefined]),
    },
});

export const getGetUserUsernameReviewsMock = () => ({
    status: faker.helpers.randomize(['ok']),
    reviews: [...Array(faker.datatype.number({ min: 1, max: 10 }))].map(() => ({
        publication: {
            id: faker.random.word(),
            name: faker.random.word(),
            title: faker.random.word(),
            introduction: faker.helpers.randomize([faker.random.word(), undefined]),
            revision: faker.helpers.randomize([faker.random.word(), undefined]),
            pinned: faker.datatype.boolean(),
            draft: faker.datatype.boolean(),
            owner: {
                id: faker.random.word(),
                email: faker.random.word(),
                username: faker.random.word(),
                firstName: faker.random.word(),
                lastName: faker.random.word(),
                createdAt: faker.datatype.number(),
                profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]),
                status: faker.helpers.randomize([faker.random.word(), undefined]),
                about: faker.helpers.randomize([faker.random.word(), undefined]),
            },
            attachment: faker.helpers.randomize([faker.datatype.boolean(), undefined]),
            collaborators: [...Array(faker.datatype.number({ min: 1, max: 10 }))].map(() => faker.random.word()),
            createdAt: faker.datatype.number(),
            updatedAt: faker.datatype.number(),
        },
        owner: {
            id: faker.random.word(),
            email: faker.random.word(),
            username: faker.random.word(),
            firstName: faker.random.word(),
            lastName: faker.random.word(),
            createdAt: faker.datatype.number(),
            profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]),
            status: faker.helpers.randomize([faker.random.word(), undefined]),
            about: faker.helpers.randomize([faker.random.word(), undefined]),
        },
        createdAt: faker.datatype.number(),
        updatedAt: faker.datatype.number(),
        id: faker.random.word(),
    })),
});

export const getGetUserUsernameRoleMock = () => ({
    status: faker.helpers.randomize(['ok']),
    role: faker.random.word(),
});

export const getPatchUserUsernameRoleMock = () => ({
    status: faker.helpers.randomize(['ok']),
    message: faker.random.word(),
    role: faker.random.word(),
});

export const getPostUserUsernameFollowMock = () => ({
    status: faker.helpers.randomize(['ok']),
    message: faker.random.word(),
});

export const getDeleteUserUsernameFollowMock = () => ({
    status: faker.helpers.randomize(['ok']),
    message: faker.random.word(),
});

export const getUsersMSW = () => [
    rest.delete('*/user/:username', (req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'), ctx.json(getDeleteUserUsernameMock()));
    }),
    rest.get('*/user/:username', (req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'), ctx.json(getGetUserUsernameMock()));
    }),
    rest.patch('*/user/:username', (req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'), ctx.json(getPatchUserUsernameMock()));
    }),
    rest.get('*/user/:username/reviews', (req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'), ctx.json(getGetUserUsernameReviewsMock()));
    }),
    rest.get('*/user/:username/role', (req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'), ctx.json(getGetUserUsernameRoleMock()));
    }),
    rest.patch('*/user/:username/role', (req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'), ctx.json(getPatchUserUsernameRoleMock()));
    }),
    rest.post('*/user/:username/follow', (req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'), ctx.json(getPostUserUsernameFollowMock()));
    }),
    rest.delete('*/user/:username/follow', (req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'), ctx.json(getDeleteUserUsernameFollowMock()));
    }),
];
