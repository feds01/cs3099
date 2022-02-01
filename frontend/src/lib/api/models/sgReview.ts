/**
 * Generated by orval v6.5.3 🍺
 * Do not edit manually.
 * Iamus API
 * This is a REST API for interfacing with Iamus. This API provides endpoints for interacting with user information, submissions, and reviews.
 * OpenAPI spec version: 1.0.0
 */
import type { SgUser } from './sgUser';
import type { SgComment } from './sgComment';

export interface SgReview {
  owner: SgUser;
  createdAt: number;
  comments: SgComment[];
}
