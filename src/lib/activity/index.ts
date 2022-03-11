import assert from 'assert';

import Logger from '../../common/logger';
import Activity, {
    AugmentedActivityDocument,
    IActivityOperationKind,
    IActivityType,
} from '../../models/Activity';
import { IUserDocument } from '../../models/User';
import { BasicRequest } from '../communication/requests';
import { ActivityMetadataTransformer } from './transformer';

/** Interface representing an activity  */
export interface ActivityType {
    type: IActivityType;
    kind: IActivityOperationKind;
}

/**
 * Class representing an activity transaction within the internal Activity sub-system. Activities
 * begin when an initial request is made that bears some resemblance or association to a given
 * sub-system that is defined within @see {IActivityType}. Each endpoint handler defined what
 * kind of activity could be recorded when receiving this kind of request, and an accompanying
 * request transformer that can extract relevant metadata to the request and store it in the
 * activity.
 */
class ActivityRecord<Params, Query, Body> {
    /** The inner activity document that's created when the transaction begins */
    activity?: AugmentedActivityDocument;

    /** Constructor for Activity record */
    constructor(
        readonly type: ActivityType,
        readonly request: BasicRequest<Params, Query, Body>,
        readonly requester: IUserDocument | null,
        readonly metadataTransformFn: ActivityMetadataTransformer<Params, Query, Body>,
    ) {}

    /** Check whether the created activity record is a valid one */
    get isValid(): boolean {
        return typeof this.activity !== 'undefined';
    }

    /**
     * Function that evaluates the parameters given to the activity record so that it
     * can deduce whether it is worth recording the activity or not.
     */
    async begin() {
        if (!this.requester) {
            return;
        }

        const activity = new Activity({
            kind: this.type.kind,
            type: this.type.type,
            owner: this.requester._id,
            isLive: false,
        });

        // If the 'type' of event is related to the user sub-system, we can instantly deduce
        // the fact that the affected 'document' will be the id of the user...
        const { metadata, document } = await this.metadataTransformFn(this.requester, this.request);
        activity.metadata = metadata;
        activity.document = document;

        try {
            await activity.save();
            this.activity = activity;
        } catch (e: unknown) {
            Logger.warn('Failed saving an activity');
        }
    }

    /**
     * This function will take the produced activity document that is currently in storage and marked
     * as 'not live', it will update the document to become live since the document should now be
     * counted as activity that did occur.
     */
    async save() {
        assert(typeof this.activity !== 'undefined');
        await Activity.findByIdAndUpdate(this.activity._id, { $set: { isLive: true } });
    }

    /**
     * This function is used to simply discard an activity that was created by the initial
     * activity transaction. An activity maybe deleted if the underlying request was unsuccessful
     * for some reason, if that is the case, then the @see {Activity} is then deleted.
     */
    async discard() {
        assert(typeof this.activity !== 'undefined');
        await Activity.findByIdAndDelete(this.activity._id);
    }
}

export default ActivityRecord;
