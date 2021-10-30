import mongoose, { Document, Model, Schema } from 'mongoose';

// export type IReviewStatus = "completed" | "started"
export enum IReviewStatus {
    Completed = 'completed',
    Started = 'started',
}

export interface IReview {
    publication: mongoose.ObjectId;
    owner: mongoose.ObjectId;
    generalComment?: mongoose.ObjectId;
    status: IReviewStatus;
}

interface IReviewDocument extends IReview, Document {}

interface IReviewModel extends Model<IReviewDocument> {}

const ReviewSchema = new Schema<IReview, IReviewModel, IReview>(
    {
        publication: { type: mongoose.Schema.Types.ObjectId, ref: 'publication', required: true },
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
        generalComment: { type: mongoose.Schema.Types.ObjectId, ref: 'comment' },
        status: { type: String, enum: IReviewStatus },
    },
    { timestamps: true },
);

export default mongoose.model<IReview, IReviewModel>('review', ReviewSchema);
