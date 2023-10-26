import {
    ActivityReference,
    AugmentedActivityDocument,
    IActivityOperationKind,
    IActivityType,
} from '../../models/Activity';
import Comment, { AugmentedCommentDocument } from '../../models/Comment';
import Publication, { AugmentedPublicationDocument } from '../../models/Publication';
import Review, { IReviewStatus, PopulatedReview } from '../../models/Review';
import User, { AugmentedUserDocument } from '../../models/User';
import {
    CommentCreateMetadata,
    PublicationCreateMetadata,
    PublicationReviseMetadata,
    ReviewCreateMetadata,
} from '../../validators/metadata';

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
    // This is the most generic possible message that can be used as a prefix, however there are
    // a few special cases which we manually override...
    let message = `${convertActivityKindIntoString(
        activity.kind,
    )} a ${convertActivityTypeIntoString(activity.type)}`;

    switch (activity.type) {
        case IActivityType.Comment:
            const comment = await Comment.findById(activity.document);
            return await generateActivityStringForComment(activity, message, comment);
        case IActivityType.Publication:
            const publication = await Publication.findById(activity.document);
            return await generateActivityStringForPublication(activity, message, publication);
        case IActivityType.User:
            const user: AugmentedUserDocument | null = await User.findById(activity.document);
            return await generateActivityStringForUser(activity, message, user);
        case IActivityType.Review:
            const review = await Review.findById(activity.document)
                .populate<{ publication: AugmentedPublicationDocument }>('publication')
                .populate<{ owner: AugmentedUserDocument }>('owner')
                .exec();

            return await generateActivityStringForReview(activity, message, review);
    }
}

/**
 * Method to generate a activity message based on metadata for 'publication types'.
 *
 * @param activity - The activity object
 * @param document - The document in question
 * @returns - Generated message prefix for the activity and any references that were generated during the
 * transformation
 */
async function generateActivityStringForPublication(
    activity: AugmentedActivityDocument,
    prefix: string,
    document: AugmentedPublicationDocument | null,
): Promise<ActivityPrefix> {
    const prefixReferences: ActivityReference[] = [];
    let message = prefix;

    // Special case: when a user a revises a publication, we want to change 'a' to 'the
    if (activity.kind === IActivityOperationKind.Revise) {
        message = 'revised the publication ';

        const result = PublicationReviseMetadata.parse(activity.metadata);

        if (document !== null) {
            message += '<1>';
            prefixReferences.push({
                type: 'publication',
                document: await Publication.project(document),
            });
        } else {
            message += `${result.owner}/${result.name}`;
        }

        message += ` from revision '${result.oldRevision}' to '${result.newRevision}'`;
    }

    // Special case: when a user creates a publication, we want to add the name of the publication
    if (activity.kind === IActivityOperationKind.Create) {
        const result = PublicationCreateMetadata.safeParse(activity.metadata);

        if (result.success) {
            if (document !== null) {
                message += ' called <1>';

                prefixReferences.push({
                    type: 'publication',
                    document: await Publication.project(document),
                });
            } else {
                message += ' called ' + result.data.name;
            }

            if (result.data.collaborators > 0) {
                message += ` with ${result.data.collaborators} collaborators`;
            }
        }
    }

    return {
        prefixMessage: message,
        prefixReferences,
    };
}

/**
 * This function is used to generate the activity message for a user, however there
 * are very few activities that are recorded for a user so there is very little
 * 'special case' transformation required.
 *
 * @param activity
 * @param document
 */
async function generateActivityStringForUser(
    _activity: AugmentedActivityDocument,
    prefix: string,
    _document: AugmentedUserDocument | null,
): Promise<ActivityPrefix> {
    return {
        prefixMessage: prefix,
        prefixReferences: [],
    };
}

/**
 * Method to generate a activity message based on metadata for 'comment types'.
 *
 * @param activity - The activity object
 * @param document - The document in question
 * @returns - Generated message prefix for the activity and any references that were generated during the
 * transformation
 */
async function generateActivityStringForComment(
    activity: AugmentedActivityDocument,
    prefix: string,
    _document: AugmentedCommentDocument | null,
): Promise<ActivityPrefix> {
    const prefixReferences: ActivityReference[] = [];
    let message = prefix;

    // Special case: when a user leaves a comment on a review, we want change 'a' to 'on the'
    if (activity.kind === IActivityOperationKind.Create) {
        if (typeof activity.metadata !== 'undefined') {
            const result = CommentCreateMetadata.safeParse(activity.metadata);

            // we only want to add the message if the review was completed
            if (result.success && result.data.reviewStatus === IReviewStatus.Completed) {
                const review = await Review.findById(result.data.reviewId)
                    .populate<{ publication: AugmentedPublicationDocument }>('publication')
                    .populate<{ owner: AugmentedUserDocument }>('owner')
                    .exec();

                if (review !== null) {
                    message = 'left a comment on the <1>';
                    prefixReferences.push({
                        type: 'review',
                        document: await Review.project(review),
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

/**
 * Method to generate a activity message based on metadata for 'review' types.
 *
 * @param activity - The activity object
 * @param document - The document in question
 * @returns - Generated message prefix for the activity and any references that were generated during the
 * transformation
 */
async function generateActivityStringForReview(
    activity: AugmentedActivityDocument,
    prefix: string,
    document: PopulatedReview | null,
): Promise<ActivityPrefix> {
    const prefixReferences: ActivityReference[] = [];
    let message = prefix;

    // Special case: when a user creates a review, we want to add 'with' at the end...
    if (activity.kind === IActivityOperationKind.Create) {
        if (typeof activity.metadata !== 'undefined') {
            const result = ReviewCreateMetadata.safeParse(activity.metadata);

            if (result.success) {
                const publication = await Publication.findById(result.data.publicationId).exec();

                if (document !== null && publication !== null) {
                    message = `left a <1> on the publication <2> with ${
                        result.data.comments
                    } comment${result.data.comments > 1 ? 's' : ''}`;
                    prefixReferences.push({
                        type: 'review',
                        document: await Review.project(document),
                    });
                    prefixReferences.push({
                        type: 'publication',
                        document: await Publication.project(publication),
                    });
                } else if (publication !== null) {
                    message = `reviewed the publication <1> and left ${result.data.comments} comments`;
                    prefixReferences.push({
                        type: 'publication',
                        document: await Publication.project(publication),
                    });
                } else {
                    message = `reviewed the publication ${result.data.publicationOwner}/${result.data.publicationName} and left ${result.data.comments} comments`;
                }
            }
        }
    }

    return {
        prefixMessage: message,
        prefixReferences,
    };
}
