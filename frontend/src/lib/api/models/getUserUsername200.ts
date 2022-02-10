/**
 * Generated by orval v6.6.0 🍺
 * Do not edit manually.
 * Iamus API
 * This is a REST API for interfacing with Iamus. This API provides endpoints for interacting with user information, submissions, and reviews.
 * OpenAPI spec version: 1.0.0
 */
import type { SuccessStatus } from './successStatus';
import type { User } from './user';
import type { FollowerCount } from './followerCount';

export type GetUserUsername200 = {
    status: SuccessStatus;
    user: User;
    follows: FollowerCount;
};
