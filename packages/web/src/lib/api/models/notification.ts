/**
 * Generated by orval v6.6.4 🍺
 * Do not edit manually.
 * Iamus API
 * This is a REST API for interfacing with Iamus. This API provides endpoints for interacting with user information, submissions, and reviews.
 * OpenAPI spec version: 1.0.0
 */
import type { Review } from './review';
import type { User } from './user';

export interface Notification {
    id: string;
    commentId: string;
    author: User;
    tagging: User;
    review: Review;
    createdAt: number;
    updatedAt: number;
}
