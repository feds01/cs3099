/**
 * Generated by orval v6.2.3 🍺
 * Do not edit manually.
 * Iamus API
 * This is a REST API for interfacing with Iamus. This API provides endpoints for interacting with user information, submissions, and reviews.
 * OpenAPI spec version: 1.0.0
 */
import type { User } from './user';

export interface Publication {
  id: string;
  name: string;
  title: string;
  introduction?: string;
  revision?: string;
  pinned: boolean;
  draft: boolean;
  owner: User;
  attachment?: boolean;
  collaborators: string[];
  createdAt: number;
  updatedAt: number;
}
