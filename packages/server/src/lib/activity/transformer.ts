import mongoose from 'mongoose';

import { AugmentedUserDocument } from '../../models/User';
import { BasicRequest } from '../communication/requests';

export interface ActivityMetadata {
    metadata?: object;
    document?: mongoose.ObjectId;
}

export type ActivityMetadataTransformer<P, Q, B> = (
    requester: AugmentedUserDocument,
    request: BasicRequest<P, Q, B, unknown>,
) => Promise<ActivityMetadata>;

/**
 * We essentially default to failing the request for verifying if a request has permissions
 * to make a request. This is done to prevent registered routes who don't have a defined
 * permission verifying function from passing the permission test.
 *
 * @param _req - Generic request
 * @param _user - The requesting user
 */
export const defaultActivityMetadataFn: ActivityMetadataTransformer<
    unknown,
    unknown,
    unknown
> = async (_user, _req) => ({});
