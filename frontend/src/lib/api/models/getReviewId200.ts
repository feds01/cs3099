/**
 * Generated by orval v6.2.3 🍺
 * Do not edit manually.
 * Iamus API
 * This is a REST API for interfacing with Iamus. This API provides endpoints for interacting with user information, submissions, and reviews.
 * OpenAPI spec version: 1.0.0
 */
import type { GetReviewId200Status } from './getReviewId200Status';
import type { Review } from './review';

export type GetReviewId200 = {
    status: GetReviewId200Status;
    review?: Review;
};
