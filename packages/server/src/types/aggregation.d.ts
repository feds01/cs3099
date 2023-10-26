import { AugmentedActivityDocument } from '../models/Activity';
import { AugmentedPublicationDocument } from '../models/Publication';
import { AugmentedReviewDocument } from '../models/Review';
import { AugmentedUserDocument } from '../models/User';

/** Aggregation result returned from Mongoose aggregations when querying publications */
export interface PublicationAggregation {
    data: AugmentedPublicationDocument[];
    total?: number;
}

/** Aggregation result returned from Mongoose aggregations when querying users */
export interface UserAggregation {
    data: AugmentedUserDocument[];
    total?: number;
}

/** Aggregation result returned from Mongoose aggregations when querying reviews */
export interface ReviewAggregation {
    data: AugmentedReviewDocument[];
    total?: number;
}

/** Aggregation result returned from Mongoose aggregations when querying activities */
export interface ActivityAggregation {
    data: AugmentedActivityDocument[];
    total?: number;
}
