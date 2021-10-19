import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISubmission {
    revision: string;
    owner: mongoose.ObjectId;
    title: string;
    introduction: string;
    collaborators: mongoose.ObjectId[];
}

interface ISubmissionDocument extends ISubmission, Document {}

interface ISubmissionModel extends Model<ISubmissionDocument> {
}

const SubmissionSchema = new Schema<ISubmission, ISubmissionModel, ISubmission>(
    {
    },
    { timestamps: true },
);

export default mongoose.model<ISubmission, ISubmissionModel>('submission', SubmissionSchema);
