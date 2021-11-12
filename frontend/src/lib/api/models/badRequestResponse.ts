/**
 * Generated by orval v6.2.3 🍺
 * Do not edit manually.
 * Iamus API
 * This is a REST API for interfacing with Iamus. This API provides endpoints for interacting with user information, submissions, and reviews.
 * OpenAPI spec version: 1.0.0
 */
import type { BadRequestResponseStatus } from './badRequestResponseStatus';
import type { BadRequestResponseExtra } from './badRequestResponseExtra';

export type BadRequestResponse = {
    status: BadRequestResponseStatus;
    message: string;
    extra?: BadRequestResponseExtra;
};
