import mongoose, { Document, Model, Schema } from 'mongoose';
import User, { IUser } from './User';
import { ExportSgReview } from '../validators/sg';

export enum IReviewStatus {
    Completed = 'completed',
    Started = 'started',
}

export interface IReview {
    publication: mongoose.ObjectId;
    owner: mongoose.ObjectId;
    status: IReviewStatus;
    createdAt: Date;
    updatedAt: Date;
}

type PopulatedReview = (IReview & {
    _id: any;
}) & {
    owner: IUser;
};

interface IReviewDocument extends IReview, Document { }

interface IReviewModel extends Model<IReviewDocument> {
    project: (review: IReview) => Partial<IReview>;
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
            requred: true,
        },
    },
    { timestamps: true },
);

/**
 * Function to project a user comment so that it can be returned as a
 * response in the API.
 *
 * @param review The comment Document that is to be projected.
 * @returns A partial comment object with selected fields that are to be projected.
 */
ReviewSchema.statics.project = (review: IReviewDocument) => {
    const { publication, owner, status } = review;

    return {
        publication,
        owner,
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
ReviewSchema.statics.projectAsSg = async (review: PopulatedReview): Promise<ExportSgReview> => ({
    owner: User.getExternalId(review.owner),
    comments: [], // TODO: Comments
    createdAt: review.createdAt.getTime(),
});
export default mongoose.model<IReview, IReviewModel>('review', ReviewSchema);
