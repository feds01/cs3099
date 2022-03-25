/**
 * Generated by orval v6.6.4 🍺
 * Do not edit manually.
 * Iamus API
 * This is a REST API for interfacing with Iamus. This API provides endpoints for interacting with user information, submissions, and reviews.
 * OpenAPI spec version: 1.0.0
 */
import type { Notification } from './notification';
import type { SkipQuery } from './skipQuery';
import type { SuccessStatus } from './successStatus';
import type { TakeQuery } from './takeQuery';

export type GetNotifications200 = {
    status: SuccessStatus;
    notifications: Notification[];
    skip: SkipQuery;
    take: TakeQuery;
    total: number;
};
