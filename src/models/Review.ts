import { ExportSgReview } from '../validators/sg';
import Comment from './Comment';
import Publication, { IPublication } from './Publication';
import User, { IUser } from './User';
import softDeleteMiddleware from './middlewares/softDelete';
import mongoose, { Document, Model, Schema } from 'mongoose';

/**
 * Representation of whether a publication is in either 'started' mode
 * which means that the owner of the review hasn't yet submitted it. The
 * 'completed' mode means that the owner has submitted it and external viewers
 * can now see the publication.
 */
export enum IReviewStatus {
    Completed = 'completed',
    Started = 'started',
}

/** The Review document represents a review on a particular publication */
export interface IReview {
    /** The ID of the review publication */
    publication: mongoose.ObjectId;
    /** The ID of the review owner */
    owner: mongoose.ObjectId;
    /** If the review is completed or not. */
    status: IReviewStatus;
    /** When the initial document was created */
    createdAt: Date;
    /** When the document was last updated */
    updatedAt: Date;
    /** If the document is 'deleted' */
    isDeleted: boolean;
}

type PopulatedReview = (IReview & {
    _id: string;
}) & {
    owner: IUser;
} & {
    publication: IPublication;
};

interface IReviewDocument extends IReview, Document {}

interface IReviewModel extends Model<IReviewDocument> {
    project: (review: IReview) => Promise<Partial<IReview>>;
    projectAsSg: (review: PopulatedReview) => Promise<ExportSgReview>;
}

const ReviewSchema = new Schema<IReview, IReviewModel, IReview>(
    {
        publication: { type: mongoose.Schema.Types.ObjectId, ref: 'publication', required: true },
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
        status: {
            type: String,
            enum: IReviewStatus,
            default: IReviewStatus.Started,
            required: true,
        },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true },
);

// Register soft-deletion middleware
ReviewSchema.plugin(softDeleteMiddleware);

/**
 * Function to project a user comment so that it can be returned as a
 * response in the API.
 *
 * @param review The comment Document that is to be projected.
 * @returns A partial comment object with selected fields that are to be projected.
 */
ReviewSchema.statics.project = async (review: PopulatedReview) => {
    const { publication, owner, status } = review;

    // If the comment is deleted, we need to do some special projection.

    return {
        id: review._id,
        publication: await Publication.project(publication),
        owner: User.project(owner),
        status,
        createdAt: review.createdAt.getTime(),
        updatedAt: review.updatedAt.getTime(),
    };
};

/**
 * Function that projects a user document into the Supergroup format so that it can
 * be returned in responses within Supergroup endpoints.
 *
 * @param user The user Document that is to be projected.
 * @returns A partial user object with selected fields that are to be projected.
 */
ReviewSchema.statics.projectAsSg = async (review: PopulatedReview): Promise<ExportSgReview> => {
    // This map represents all the comments seen in the current transformation, it uses a
    // mapping of string (ObjectId in this case) to number in order to convert it to a
    // standardised format so that other supergroups can transform the comments in whatever
    // way that they wish.
    const commentMap: Map<string, number> = new Map();

    const comments = await Comment.find({ review: review._id })
        .populate<{ owner: IUser }>('owner')
        .exec();

    // firstly we want to populate the comment map...
    comments.forEach((comment, index) => {
        commentMap.set(comment._id.toString(), index);
    });

    const projectedComments = comments.map((comment) => {
        const id = commentMap.get(comment._id.toString())!;
        let replying;

        if (typeof comment.replying !== 'undefined') {
            replying = commentMap.get(comment.replying.toString());
        }

        return Comment.projectAsSg(id, comment, replying);
    });

    return {
        owner: User.getExternalId(review.owner),
        comments: projectedComments,
        createdAt: review.createdAt.getTime(),
    };
};

export default mongoose.model<IReview, IReviewModel>('review', ReviewSchema);
