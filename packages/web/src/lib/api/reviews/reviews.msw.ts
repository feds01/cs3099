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

export const getPostPublicationUsernameNameReviewMock = () => ({
    status: faker.helpers.randomize(Object.values(SuccessStatus)),
    review: {
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
            reviews: faker.datatype.number(),
            owner: {
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
            attachment: faker.helpers.randomize([faker.datatype.boolean(), undefined]),
            collaborators: [...Array(faker.datatype.number({ min: 1, max: 10 }))].map(() => ({
                id: faker.random.word(),
                email: faker.random.word(),
                username: faker.random.word(),
                role: faker.helpers.randomize(Object.values(UserRole)),
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
            role: faker.helpers.randomize(Object.values(UserRole)),
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
    },
});

export const getGetPublicationUsernameNameReviewsMock = () => ({
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
                role: faker.helpers.randomize(Object.values(UserRole)),
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
                role: faker.helpers.randomize(Object.values(UserRole)),
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
            role: faker.helpers.randomize(Object.values(UserRole)),
            name: faker.helpers.randomize([faker.random.word(), undefined]),
            createdAt: faker.datatype.number(),
            profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]),
            status: faker.helpers.randomize([faker.random.word(), undefined]),
            about: faker.helpers.randomize([faker.random.word(), undefined]),
        },
        createdAt: faker.datatype.number(),
        updatedAt: faker.datatype.number(),
        status: faker.helpers.randomize(Object.values(ReviewStatus)),
        id: faker.random.word(),
    })),
});

export const getPostPublicationbyidIdReviewMock = () => ({
    status: faker.helpers.randomize(Object.values(SuccessStatus)),
    review: {
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
            reviews: faker.datatype.number(),
            owner: {
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
            attachment: faker.helpers.randomize([faker.datatype.boolean(), undefined]),
            collaborators: [...Array(faker.datatype.number({ min: 1, max: 10 }))].map(() => ({
                id: faker.random.word(),
                email: faker.random.word(),
                username: faker.random.word(),
                role: faker.helpers.randomize(Object.values(UserRole)),
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
            role: faker.helpers.randomize(Object.values(UserRole)),
            name: faker.helpers.randomize([faker.random.word(), undefined]),
            createdAt: faker.datatype.number(),
            profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]),
            status: faker.helpers.randomize([faker.random.word(), undefined]),
            about: faker.helpers.randomize([faker.random.word(), undefined]),
        },
        createdAt: faker.datatype.number(),
        updatedAt: faker.datatype.number(),
        status: faker.helpers.randomize(Object.values(ReviewStatus)),
        id: faker.random.word(),
    },
});

export const getGetPublicationbyidIdReviewsMock = () => ({
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
                role: faker.helpers.randomize(Object.values(UserRole)),
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
                role: faker.helpers.randomize(Object.values(UserRole)),
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
            role: faker.helpers.randomize(Object.values(UserRole)),
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

export const getPutReviewIdCommentMock = () => ({
    status: faker.helpers.randomize(Object.values(SuccessStatus)),
    comment: {
        id: faker.random.word(),
        edited: faker.datatype.boolean(),
        filename: faker.helpers.randomize([faker.random.word(), undefined]),
        anchor: faker.helpers.randomize([{ start: faker.datatype.number(), end: faker.datatype.number() }, undefined]),
        contents: faker.random.word(),
        thread: faker.random.word(),
        review: faker.random.word(),
        replying: faker.helpers.randomize([faker.random.word(), undefined]),
        author: {
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
        createdAt: faker.datatype.number(),
        updatedAt: faker.datatype.number(),
    },
});

export const getGetReviewMock = () => ({
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
                role: faker.helpers.randomize(Object.values(UserRole)),
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
                role: faker.helpers.randomize(Object.values(UserRole)),
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
            role: faker.helpers.randomize(Object.values(UserRole)),
            name: faker.helpers.randomize([faker.random.word(), undefined]),
            createdAt: faker.datatype.number(),
            profilePictureUrl: faker.helpers.randomize([faker.random.word(), undefined]),
            status: faker.helpers.randomize([faker.random.word(), undefined]),
            about: faker.helpers.randomize([faker.random.word(), undefined]),
        },
        createdAt: faker.datatype.number(),
        updatedAt: faker.datatype.number(),
        status: faker.helpers.randomize(Object.values(ReviewStatus)),
        id: faker.random.word(),
    })),
    skip: faker.datatype.number(),
    take: faker.datatype.number(),
    total: faker.datatype.number(),
});

export const getGetReviewIdMock = () => ({
    status: faker.helpers.randomize(Object.values(SuccessStatus)),
    review: {
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
            reviews: faker.datatype.number(),
            owner: {
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
            attachment: faker.helpers.randomize([faker.datatype.boolean(), undefined]),
            collaborators: [...Array(faker.datatype.number({ min: 1, max: 10 }))].map(() => ({
                id: faker.random.word(),
                email: faker.random.word(),
                username: faker.random.word(),
                role: faker.helpers.randomize(Object.values(UserRole)),
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
            role: faker.helpers.randomize(Object.values(UserRole)),
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
    },
});

export const getGetReviewIdCommentsMock = () => ({
    status: faker.helpers.randomize(Object.values(SuccessStatus)),
    comments: [...Array(faker.datatype.number({ min: 1, max: 10 }))].map(() => ({
        id: faker.random.word(),
        edited: faker.datatype.boolean(),
        filename: faker.helpers.randomize([faker.random.word(), undefined]),
        anchor: faker.helpers.randomize([{ start: faker.datatype.number(), end: faker.datatype.number() }, undefined]),
        contents: faker.random.word(),
        thread: faker.random.word(),
        review: faker.random.word(),
        replying: faker.helpers.randomize([faker.random.word(), undefined]),
        author: {
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
        createdAt: faker.datatype.number(),
        updatedAt: faker.datatype.number(),
    })),
});

export const getReviewsMSW = () => [
    rest.post('*/publication/:username/:name/review', (_req, res, ctx) => {
        return res(
            ctx.delay(1000),
            ctx.status(200, 'Mocked status'),
            ctx.json(getPostPublicationUsernameNameReviewMock()),
        );
    }),
    rest.get('*/publication/:username/:name/reviews', (_req, res, ctx) => {
        return res(
            ctx.delay(1000),
            ctx.status(200, 'Mocked status'),
            ctx.json(getGetPublicationUsernameNameReviewsMock()),
        );
    }),
    rest.post('*/publication-by-id/:id/review', (_req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'), ctx.json(getPostPublicationbyidIdReviewMock()));
    }),
    rest.get('*/publication-by-id/:id/reviews', (_req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'), ctx.json(getGetPublicationbyidIdReviewsMock()));
    }),
    rest.put('*/review/:id/comment', (_req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'), ctx.json(getPutReviewIdCommentMock()));
    }),
    rest.get('*/review', (_req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'), ctx.json(getGetReviewMock()));
    }),
    rest.get('*/review/:id', (_req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'), ctx.json(getGetReviewIdMock()));
    }),
    rest.delete('*/review/:id', (_req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'));
    }),
    rest.get('*/review/:id/comments', (_req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'), ctx.json(getGetReviewIdCommentsMock()));
    }),
    rest.post('*/review/:id/complete', (_req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'));
    }),
];