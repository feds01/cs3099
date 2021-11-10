/**
 * Generated by orval v6.2.3 🍺
 * Do not edit manually.
 * Iamus API
 * This is a REST API for interfacing with Iamus. This API provides endpoints for interacting with user information, submissions, and reviews.
 * OpenAPI spec version: 1.0.0
 */
import type { User } from './user';
import type { Comment } from './comment';

export interface Review {
  owner: User;
  createdAt: number;
  threads: Comment[][];
}