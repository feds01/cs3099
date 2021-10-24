/**
 * Generated by orval v6.2.3 🍺
 * Do not edit manually.
 * Iamus API
 * This is a REST API for interfacing with Iamus. This API provides endpoints for interacting with user information, submissions, and reviews.
 * OpenAPI spec version: 1.0.0
 */
import type { FollowerCount } from './followerCount';
import type { User } from './user';

export type GetUserUsername200 = {
    follows: FollowerCount;
    status: boolean;
    user: User;
};
