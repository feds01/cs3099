/**
 * Generated by orval v6.6.4 🍺
 * Do not edit manually.
 * Iamus API
 * This is a REST API for interfacing with Iamus. This API provides endpoints for interacting with user information, submissions, and reviews.
 * OpenAPI spec version: 1.0.0
 */
import { SuccessStatus } from '.././models';
import faker from 'faker';
import { rest } from 'msw';

export const getDeleteUserUsernameMock = () => ({ status: faker.helpers.randomize(Object.values(SuccessStatus)) });

export const getGetUserUsernameMock = () => ({
    status: faker.helpers.randomize(Object.values(SuccessStatus)),
    user: {
        id: faker.random.word(),
        email: faker.random.word(),
        username: faker.random.word(),
        role: faker.helpers.randomize(['default', 'moderator', 'administrator']),
        name: faker.helpers.randomize([faker.random.word(), undefined]),
        createdAt: faker.datatype.number(),
        profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]),
        status: faker.helpers.randomize([faker.random.word(), undefined]),
        about: faker.helpers.randomize([faker.random.word(), undefined]),
    },
    follows: { followers: faker.datatype.number(), following: faker.datatype.number() },
});

export const getPatchUserUsernameMock = () => ({
    status: faker.helpers.randomize(Object.values(SuccessStatus)),
    user: {
        id: faker.random.word(),
        email: faker.random.word(),
        username: faker.random.word(),
        role: faker.helpers.randomize(['default', 'moderator', 'administrator']),
        name: faker.helpers.randomize([faker.random.word(), undefined]),
        createdAt: faker.datatype.number(),
        profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]),
        status: faker.helpers.randomize([faker.random.word(), undefined]),
        about: faker.helpers.randomize([faker.random.word(), undefined]),
    },
});

export const getDeleteUserUsernameAvatarMock = () => ({
    status: faker.helpers.randomize(Object.values(SuccessStatus)),
});

export const getGetUserUsernameAvatarMock = () => faker.random.word();

export const getGetUserUsernameReviewsMock = () => ({
    status: faker.helpers.randomize(Object.values(SuccessStatus)),
    reviews: [...Array(faker.datatype.number({ min: 1, max: 10 }))].map(() => ({
        publication: {
            id: faker.random.word(),
            name: faker.random.word(),
            title: faker.random.word(),
            introduction: faker.helpers.randomize([faker.random.word(), undefined]),
            changelog: faker.helpers.randomize([faker.random.word(), undefined]),
            about: faker.helpers.randomize([faker.random.word(), undefined]),
            revision: faker.random.word(),
            pinned: faker.datatype.boolean(),
            draft: faker.datatype.boolean(),
            current: faker.datatype.boolean(),
            owner: {
                id: faker.random.word(),
                email: faker.random.word(),
                username: faker.random.word(),
                role: faker.helpers.randomize(['default', 'moderator', 'administrator']),
                name: faker.helpers.randomize([faker.random.word(), undefined]),
                createdAt: faker.datatype.number(),
                profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]),
                status: faker.helpers.randomize([faker.random.word(), undefined]),
                about: faker.helpers.randomize([faker.random.word(), undefined]),
            },
            attachment: faker.helpers.randomize([faker.datatype.boolean(), undefined]),
            collaborators: [...Array(faker.datatype.number({ min: 1, max: 10 }))].map(() => ({
                id: faker.random.word(),
                email: faker.random.word(),
                username: faker.random.word(),
                role: faker.helpers.randomize(['default', 'moderator', 'administrator']),
                name: faker.helpers.randomize([faker.random.word(), undefined]),
                createdAt: faker.datatype.number(),
                profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]),
                status: faker.helpers.randomize([faker.random.word(), undefined]),
                about: faker.helpers.randomize([faker.random.word(), undefined]),
            })),
            createdAt: faker.datatype.number(),
            updatedAt: faker.datatype.number(),
        },
        owner: {
            id: faker.random.word(),
            email: faker.random.word(),
            username: faker.random.word(),
            role: faker.helpers.randomize(['default', 'moderator', 'administrator']),
            name: faker.helpers.randomize([faker.random.word(), undefined]),
            createdAt: faker.datatype.number(),
            profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]),
            status: faker.helpers.randomize([faker.random.word(), undefined]),
            about: faker.helpers.randomize([faker.random.word(), undefined]),
        },
        createdAt: faker.datatype.number(),
        updatedAt: faker.datatype.number(),
        status: faker.helpers.randomize(['started', 'completed']),
        id: faker.random.word(),
    })),
});

export const getGetUserUsernameRoleMock = () => ({
    status: faker.helpers.randomize(Object.values(SuccessStatus)),
    role: faker.random.word(),
});

export const getPatchUserUsernameRoleMock = () => ({
    status: faker.helpers.randomize(Object.values(SuccessStatus)),
    role: faker.random.word(),
});

export const getPostUserUsernameFollowMock = () => ({ status: faker.helpers.randomize(Object.values(SuccessStatus)) });

export const getDeleteUserUsernameFollowMock = () => ({
    status: faker.helpers.randomize(Object.values(SuccessStatus)),
});

export const getUsersMSW = () => [
    rest.delete('*/user/:username', (_req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'), ctx.json(getDeleteUserUsernameMock()));
    }),
    rest.get('*/user/:username', (_req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'), ctx.json(getGetUserUsernameMock()));
    }),
    rest.patch('*/user/:username', (_req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'), ctx.json(getPatchUserUsernameMock()));
    }),
    rest.delete('*/user/:username/avatar', (_req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'), ctx.json(getDeleteUserUsernameAvatarMock()));
    }),
    rest.get('*/user/:username/avatar', (_req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'), ctx.json(getGetUserUsernameAvatarMock()));
    }),
    rest.get('*/user/:username/reviews', (_req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'), ctx.json(getGetUserUsernameReviewsMock()));
    }),
    rest.get('*/user/:username/role', (_req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'), ctx.json(getGetUserUsernameRoleMock()));
    }),
    rest.patch('*/user/:username/role', (_req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'), ctx.json(getPatchUserUsernameRoleMock()));
    }),
    rest.post('*/user/:username/follow', (_req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'), ctx.json(getPostUserUsernameFollowMock()));
    }),
    rest.delete('*/user/:username/follow', (_req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'), ctx.json(getDeleteUserUsernameFollowMock()));
    }),
];
