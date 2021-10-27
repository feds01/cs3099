import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISubmission {
    revision: string;
    owner: mongoose.ObjectId;
    title: string;
    introduction: string;
    collaborators: mongoose.ObjectId[];
}

interface ISubmissionDocument extends ISubmission, Document {}

interface ISubmissionModel extends Model<ISubmissionDocument> {}

const SubmissionSchema = new Schema<ISubmission, ISubmissionModel, ISubmission>(
    {
        revision: { type: String, required: true },
        title: { type: String, required: true },
        introduction: { type: String, required: true },
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
        collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    },
    { timestamps: true },
);

export default mongoose.model<ISubmission, ISubmissionModel>('submission', SubmissionSchema);
