/**
 * Generated by orval v6.6.4 🍺
 * Do not edit manually.
 * Iamus API
 * This is a REST API for interfacing with Iamus. This API provides endpoints for interacting with user information, submissions, and reviews.
 * OpenAPI spec version: 1.0.0
 */
import type { ResponseErrorMessage } from './responseErrorMessage';

export interface ResponseError {
    /** Specific error code identifier. */
    code?: number;
    message: ResponseErrorMessage;
}
