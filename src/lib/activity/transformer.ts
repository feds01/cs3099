import mongoose from 'mongoose';

import { IUserDocument } from '../../models/User';
import { BasicRequest } from '../communication/requests';

export interface ActivityMetadata {
    metadata?: object;
    document?: mongoose.ObjectId;
}

export type ActivityMetadataTransformer<P, Q, B> = (
    requester: IUserDocument,
    request: BasicRequest<P, Q, B>,
) => Promise<ActivityMetadata>;

/**
 * We essentially default to failing the request for verifying if a request has permissions
 * to make a request. This is done to prevent registered routes who don't have a defined
 * permission verifying function from passing the permission test.
 *
 * @param _req - Generic request
 * @param _user - The requesting user
 */
export const defaultActivityMetadataFn = async <P, Q, B>(
    _user: IUserDocument,
    _req: BasicRequest<P, Q, B>,
): Promise<ActivityMetadata> => ({});
