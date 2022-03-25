import mongoose from 'mongoose';

import { AugmentedUserDocument } from '../../models/User';
import { BasicRequest } from '../communication/requests';

/**
 * This type represents what a metadata collector function may collect
 * when recording an activity.
 */
export interface ActivityMetadata {
    /** Any collected metadata to aid the construction of messages when recording activities */
    metadata?: object;
    /** The document that the activity is referencing */
    document?: mongoose.Types.ObjectId;
    /** Whether or not the activity should become instantly live and visible */
    liveness: boolean;
}

export type ActivityMetadataTransformer<P, Q, PermData, B, Res> = (
    requester: AugmentedUserDocument,
    request: BasicRequest<P, Q, B, unknown> & { permissionData: PermData | null },
    response?: Res,
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
    unknown,
    unknown,
    unknown
> = async (_user, _req) => ({ liveness: true });
