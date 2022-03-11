import {
    ActivityReference,
    AugmentedActivityDocument,
    IActivityOperationKind,
    IActivityType,
} from '../../models/Activity';
import Publication from '../../models/Publication';
import Review, { IReviewStatus } from '../../models/Review';
import { CommentCreateMetadata, ReviewCreateMetadata } from '../../validators/metadata';

type ActivityPrefix = {
    prefixMessage: string;
    prefixReferences: ActivityReference[];
};

function convertActivityTypeIntoString(type: IActivityType): string {
    switch (type) {
        case IActivityType.Comment:
            return 'comment';
        case IActivityType.Publication:
            return 'publication';
        case IActivityType.Review:
            return 'review';
        case IActivityType.User:
            return 'user';
    }
}

function convertActivityKindIntoString(kind: IActivityOperationKind): string {
    switch (kind) {
        case IActivityOperationKind.Create:
            return 'created';
        case IActivityOperationKind.Delete:
            return 'deleted';
        case IActivityOperationKind.Revise:
            return 'revised';
        case IActivityOperationKind.Update:
            return 'updated';
    }
}

/**
 * Function that computes the activity message prefix from the given information about the activity. This
 * operation is infallible since there is a basic method of transforming an activity into a prefix.
 * There are of course more complex scenarios where the function might compute better prefixes (which
 * are fallible), but if that process fails, the message will always default to the basic message.
 *
 * @param activity - The activity object
 * @returns - Generated message prefix for the activity and any references that were generated during the
 * transformation
 */
export async function computeActivityPrefix(
    activity: AugmentedActivityDocument,
): Promise<ActivityPrefix> {
    const prefixReferences: ActivityReference[] = [];

    // This is the most generic possible message that can be used as a prefix, however there
    // a few special cases which we manually override...
    let message = `${convertActivityKindIntoString(
        activity.kind,
    )} a ${convertActivityTypeIntoString(activity.type)}`;

    // Special case: when a user a revises a publication, we want to change 'a' to 'the
    if (
        activity.kind === IActivityOperationKind.Revise &&
        activity.type === IActivityType.Publication
    ) {
        message = 'revised the publication';
    }

    // Special case: when a user leaves a comment on a review, we want change 'a' to 'on the'
    if (
        activity.kind === IActivityOperationKind.Create &&
        activity.type === IActivityType.Comment
    ) {
        if (typeof activity.metadata !== 'undefined') {
            const result = CommentCreateMetadata.safeParse(activity.metadata);

            // we only want to add the message if the review was completed
            if (result.success && result.data.reviewStatus === IReviewStatus.Completed) {
                const review = await Review.findById(result.data.reviewId).exec();

                if (review !== null) {
                    message = 'left a comment on the review <1>';
                    prefixReferences.push({
                        type: 'review',
                        document: await Review.project(review),
                    });
                }
            }
        }
    }

    // Special case: when a user creates a review, we want to add 'with' at the end...
    if (activity.kind === IActivityOperationKind.Create && activity.type === IActivityType.Review) {
        if (typeof activity.metadata !== 'undefined') {
            const result = ReviewCreateMetadata.safeParse(activity.metadata);

            if (result.success) {
                const review = await Review.findById(result.data.reviewId).exec();
                const publication = await Publication.findById(result.data.publicationId).exec();

                if (review !== null && publication !== null) {
                    message = `left the review <1> the publication <2> and left ${result.data.comments} comments`;
                    prefixReferences.push({
                        type: 'review',
                        document: await Review.project(review),
                    });
                    prefixReferences.push({
                        type: 'publication',
                        document: await Publication.project(publication),
                    });
                } else if (publication !== null) {
                    message = 'reviewed the publication <1>';
                    prefixReferences.push({
                        type: 'publication',
                        document: await Publication.project(publication),
                    });
                }
            }
        }
    }

    return {
        prefixMessage: message,
        prefixReferences,
    };
}
