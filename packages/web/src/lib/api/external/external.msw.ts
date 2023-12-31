/**
 * Generated by orval v6.6.4 🍺
 * Do not edit manually.
 * Iamus API
 * This is a REST API for interfacing with Iamus. This API provides endpoints for interacting with user information, submissions, and reviews.
 * OpenAPI spec version: 1.0.0
 */
import { SuccessStatus, UserRole } from '.././models';
import faker from 'faker';
import { rest } from 'msw';

export const getGetSgSsoLoginMock = () => ({
    status: faker.helpers.randomize([faker.helpers.randomize(Object.values(SuccessStatus)), undefined]),
    token: faker.random.word(),
    refreshToken: faker.random.word(),
    user: {
        id: faker.random.word(),
        email: faker.random.word(),
        username: faker.random.word(),
        role: faker.helpers.randomize(Object.values(UserRole)),
        name: faker.helpers.randomize([faker.random.word(), undefined]),
        createdAt: faker.datatype.number(),
        profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]),
        status: faker.helpers.randomize([faker.random.word(), undefined]),
        about: faker.helpers.randomize([faker.random.word(), undefined]),
    },
});

export const getPostSgSsoVerifyMock = () => ({
    status: faker.helpers.randomize(Object.values(SuccessStatus)),
    id: faker.random.word(),
    name: faker.random.word(),
    email: faker.random.word(),
    profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]),
});

export const getGetSgResourcesExportIdMock = () => faker.random.word();

export const getGetSgResourcesExportIdMetadataMock = () => ({
    status: faker.helpers.randomize(Object.values(SuccessStatus)),
    publication: {
        name: faker.random.word(),
        title: faker.random.word(),
        owner: faker.random.word(),
        introduction: faker.random.word(),
        revision: faker.helpers.randomize([faker.random.word(), undefined]),
        collaborators: [...Array(faker.datatype.number({ min: 1, max: 10 }))].map(() => faker.random.word()),
    },
    reviews: [...Array(faker.datatype.number({ min: 1, max: 10 }))].map(() => ({
        owner: faker.random.word(),
        createdAt: faker.datatype.number(),
        comments: [...Array(faker.datatype.number({ min: 1, max: 10 }))].map(() => ({
            id: faker.datatype.number(),
            replying: faker.helpers.randomize([faker.datatype.number(), undefined]),
            filename: faker.helpers.randomize([faker.random.word(), undefined]),
            anchor: faker.helpers.randomize([
                { start: faker.datatype.number(), end: faker.datatype.number() },
                undefined,
            ]),
            contents: faker.random.word(),
            author: faker.random.word(),
            thread: faker.datatype.number(),
            postedAt: faker.datatype.number(),
        })),
    })),
});

export const getGetSgUsersIdMock = () => ({
    status: faker.helpers.randomize(Object.values(SuccessStatus)),
    id: faker.random.word(),
    name: faker.random.word(),
    email: faker.random.word(),
    profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]),
});

export const getExternalMSW = () => [
    rest.get('*/sg/sso/login', (_req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'), ctx.json(getGetSgSsoLoginMock()));
    }),
    rest.post('*/sg/sso/verify', (_req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'), ctx.json(getPostSgSsoVerifyMock()));
    }),
    rest.get('*/sg/sso/callback', (_req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'));
    }),
    rest.post('*/sg/resources/import', (_req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'));
    }),
    rest.get('*/sg/resources/export/:id', (_req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'), ctx.json(getGetSgResourcesExportIdMock()));
    }),
    rest.get('*/sg/resources/export/:id/metadata', (_req, res, ctx) => {
        return res(
            ctx.delay(1000),
            ctx.status(200, 'Mocked status'),
            ctx.json(getGetSgResourcesExportIdMetadataMock()),
        );
    }),
    rest.get('*/sg/users/:id', (_req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'), ctx.json(getGetSgUsersIdMock()));
    }),
];
