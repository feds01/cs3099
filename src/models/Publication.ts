import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPublication {
    revision: string;
    owner: mongoose.Types.ObjectId;
    title: string;
    name: string;
    introduction: string;
    attachment?: string;
    draft: boolean;
    collaborators: mongoose.Types.ObjectId[];
}

export interface IPublicationDocument extends IPublication, Document {}

interface IPublicationModel extends Model<IPublicationDocument> {}

const PublicationSchema = new Schema<IPublication, IPublicationModel, IPublication>(
    {
        revision: { type: String, required: true },
        name: { type: String, required: true },
        title: { type: String, required: true },
        introduction: { type: String, required: true },
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
        draft: { type: Boolean, required: true },
        collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    },
    { timestamps: true },
);

export default mongoose.model<IPublication, IPublicationModel>('publication', PublicationSchema);
