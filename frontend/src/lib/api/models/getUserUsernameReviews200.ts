/**
 * Generated by orval v6.2.3 🍺
 * Do not edit manually.
 * Iamus API
 * This is a REST API for interfacing with Iamus. This API provides endpoints for interacting with user information, submissions, and reviews.
 * OpenAPI spec version: 1.0.0
 */
import type { GetUserUsernameReviews200Status } from './getUserUsernameReviews200Status';
import type { Review } from './review';

export type GetUserUsernameReviews200 = {
  status?: GetUserUsernameReviews200Status;
  reviews?: Review[];
};