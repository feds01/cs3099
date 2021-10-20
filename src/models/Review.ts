import mongoose, { Document, Model, Schema } from 'mongoose';

// export type IReviewStatus = "completed" | "started"
export enum IReviewStatus {
    Completed = 'completed',
    Started = 'started',
}

export interface IReview {
    submission: mongoose.ObjectId;
    owner: mongoose.ObjectId;
    generalComment?: mongoose.ObjectId;
    status: IReviewStatus;
}

interface IReviewDocument extends IReview, Document {}

interface IReviewModel extends Model<IReviewDocument> {}

const ReviewSchema = new Schema<IReview, IReviewModel, IReview>(
    {
        submission: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        generalComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
        status: { type: String, enum: IReviewStatus },
    },
    { timestamps: true },
);

export default mongoose.model<IReview, IReviewModel>('review', ReviewSchema);
