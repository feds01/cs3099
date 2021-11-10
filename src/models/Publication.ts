import assert from 'assert';
import mongoose, { Document, Model, Schema } from 'mongoose';
import User, { IUserDocument } from './User';

export interface IPublication {
    revision?: string;
    owner: mongoose.Types.ObjectId;
    title: string;
    name: string;
    introduction?: string;
    draft: boolean;
    current: boolean;
    pinned: boolean;
    collaborators: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IPublicationDocument extends IPublication, Document {}

interface IPublicationModel extends Model<IPublicationDocument> {
    project: (publication: IPublication) => Promise<Partial<IPublication>>;
    projectWith: (publication: IPublication, user: IUserDocument) => Promise<Partial<IPublication>>;
}

const PublicationSchema = new Schema<IPublication, IPublicationModel, IPublication>(
    {
        revision: { type: String },
        name: { type: String, required: true },
        title: { type: String, required: true },
        introduction: { type: String },
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
        draft: { type: Boolean, required: true },
        current: { type: Boolean, required: true },
        pinned: { type: Boolean, default: false },
        collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    },
    { timestamps: true },
);

PublicationSchema.statics.project = async (publication: IPublicationDocument) => {
    const { name, title, introduction, draft, owner: ownerId, collaborators } = publication;

    // Resolve the owner name...
    const owner = await User.findById(ownerId).exec();

    return {
        name,
        title,
        introduction,
        owner,
        pinned: publication.pinned ?? false,
        draft,
        collaborators, // TODO: project collaborators too...
        createdAt: publication.createdAt.getTime(),
    };
};

PublicationSchema.statics.projectWith = (
    publication: IPublicationDocument,
    owner: IUserDocument,
) => {
    const { name, title, introduction, draft, owner: ownerId, collaborators } = publication;

    assert(owner.id === ownerId._id.toString(), 'Owner ids mis-match');

    return {
        name,
        title,
        introduction,
        owner: User.project(owner),
        draft,

        // TODO: project collaborators too...
        collaborators,
    };
};

export default mongoose.model<IPublication, IPublicationModel>('publication', PublicationSchema);
