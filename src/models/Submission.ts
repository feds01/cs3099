import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISubmission {
    revision: string;
    owner: mongoose.Types.ObjectId;
    title: string;
    introduction: string;
    attachment?: string;
    collaborators: mongoose.Types.ObjectId[];
}

export interface ISubmissionDocument extends ISubmission, Document {}

interface ISubmissionModel extends Model<ISubmissionDocument> {}

const SubmissionSchema = new Schema<ISubmission, ISubmissionModel, ISubmission>(
    {
        revision: { type: String, required: true },
        title: { type: String, required: true },
        introduction: { type: String, required: true },
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
        attachment: { type: String },
        collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    },
    { timestamps: true },
);

export default mongoose.model<ISubmission, ISubmissionModel>('submission', SubmissionSchema);
