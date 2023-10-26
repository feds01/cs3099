/**
 * Generated by orval v6.6.4 🍺
 * Do not edit manually.
 * Iamus API
 * This is a REST API for interfacing with Iamus. This API provides endpoints for interacting with user information, submissions, and reviews.
 * OpenAPI spec version: 1.0.0
 */
import { SuccessStatus, ActivityType, ActivityKind, UserRole, ReviewStatus } from '.././models';
import faker from 'faker';
import { rest } from 'msw';

export const getGetUserUsernameFeedMock = () => ({
    status: faker.helpers.randomize(Object.values(SuccessStatus)),
    activities: [...Array(faker.datatype.number({ min: 1, max: 10 }))].map(() => ({
        id: faker.random.word(),
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
        type: faker.helpers.randomize(Object.values(ActivityType)),
        kind: faker.helpers.randomize(Object.values(ActivityKind)),
        createdAt: faker.datatype.number(),
        updatedAt: faker.datatype.number(),
        message: faker.random.word(),
        references: [...Array(faker.datatype.number({ min: 1, max: 10 }))].map(() =>
            faker.helpers.randomize([
                {
                    type: faker.helpers.randomize(['publication']),
                    document: {
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
                },
                {
                    type: faker.helpers.randomize(['user']),
                    document: {
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
                },
                {
                    type: faker.helpers.randomize(['comment']),
                    document: {
                        id: faker.random.word(),
                        edited: faker.datatype.boolean(),
                        filename: faker.helpers.randomize([faker.random.word(), undefined]),
                        anchor: faker.helpers.randomize([
                            { start: faker.datatype.number(), end: faker.datatype.number() },
                            undefined,
                        ]),
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
                },
                {
                    type: faker.helpers.randomize(['review']),
                    document: {
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
                },
            ]),
        ),
    })),
    skip: faker.datatype.number(),
    take: faker.datatype.number(),
    total: faker.datatype.number(),
});

export const getGetActivityIdMock = () => ({
    status: faker.helpers.randomize(Object.values(SuccessStatus)),
    activity: {
        id: faker.random.word(),
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
        type: faker.helpers.randomize(Object.values(ActivityType)),
        kind: faker.helpers.randomize(Object.values(ActivityKind)),
        createdAt: faker.datatype.number(),
        updatedAt: faker.datatype.number(),
        message: faker.random.word(),
        references: [...Array(faker.datatype.number({ min: 1, max: 10 }))].map(() =>
            faker.helpers.randomize([
                {
                    type: faker.helpers.randomize(['publication']),
                    document: {
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
                },
                {
                    type: faker.helpers.randomize(['user']),
                    document: {
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
                },
                {
                    type: faker.helpers.randomize(['comment']),
                    document: {
                        id: faker.random.word(),
                        edited: faker.datatype.boolean(),
                        filename: faker.helpers.randomize([faker.random.word(), undefined]),
                        anchor: faker.helpers.randomize([
                            { start: faker.datatype.number(), end: faker.datatype.number() },
                            undefined,
                        ]),
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
                },
                {
                    type: faker.helpers.randomize(['review']),
                    document: {
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
                },
            ]),
        ),
    },
});

export const getGetActivityMock = () => ({
    status: faker.helpers.randomize(Object.values(SuccessStatus)),
    activities: [...Array(faker.datatype.number({ min: 1, max: 10 }))].map(() => ({
        id: faker.random.word(),
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
        type: faker.helpers.randomize(Object.values(ActivityType)),
        kind: faker.helpers.randomize(Object.values(ActivityKind)),
        createdAt: faker.datatype.number(),
        updatedAt: faker.datatype.number(),
        message: faker.random.word(),
        references: [...Array(faker.datatype.number({ min: 1, max: 10 }))].map(() =>
            faker.helpers.randomize([
                {
                    type: faker.helpers.randomize(['publication']),
                    document: {
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
                },
                {
                    type: faker.helpers.randomize(['user']),
                    document: {
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
                },
                {
                    type: faker.helpers.randomize(['comment']),
                    document: {
                        id: faker.random.word(),
                        edited: faker.datatype.boolean(),
                        filename: faker.helpers.randomize([faker.random.word(), undefined]),
                        anchor: faker.helpers.randomize([
                            { start: faker.datatype.number(), end: faker.datatype.number() },
                            undefined,
                        ]),
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
                },
                {
                    type: faker.helpers.randomize(['review']),
                    document: {
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
                },
            ]),
        ),
    })),
    skip: faker.datatype.number(),
    take: faker.datatype.number(),
    total: faker.datatype.number(),
});

export const getActivityMSW = () => [
    rest.get('*/user/:username/feed', (_req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'), ctx.json(getGetUserUsernameFeedMock()));
    }),
    rest.get('*/activity/:id', (_req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'), ctx.json(getGetActivityIdMock()));
    }),
    rest.get('*/activity', (_req, res, ctx) => {
        return res(ctx.delay(1000), ctx.status(200, 'Mocked status'), ctx.json(getGetActivityMock()));
    }),
];