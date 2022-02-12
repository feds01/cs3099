import assert from 'assert';
import mongoose, { Document, Model, Schema } from 'mongoose';

import { ExportSgPublication } from '../validators/sg';
import User, { IUserDocument } from './User';

export interface IPublication {
    revision: string;
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
    project: (publication: IPublication, attachment?: boolean) => Promise<Partial<IPublication>>;
    projectWith: (publication: IPublication, user: IUserDocument) => Promise<Partial<IPublication>>;
    projectAsSg: (publication: IPublicationDocument) => Promise<ExportSgPublication>;
}

const PublicationSchema = new Schema<IPublication, IPublicationModel, IPublication>(
    {
        revision: { type: String, required: true },
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

PublicationSchema.statics.project = async (
    publication: IPublicationDocument,
    attachment?: boolean,
) => {
    const { name, title, introduction, draft, owner: ownerId, collaborators } = publication;

    // Resolve the owner name...
    const owner = await User.findById(ownerId).exec();
    assert(owner !== null, 'Owner ID is null');

    return {
        id: publication.id as string,
        name,
        title,
        introduction,
        owner: User.project(owner),
        pinned: publication.pinned,
        draft,
        collaborators, // TODO: project collaborators too...
        createdAt: publication.createdAt.getTime(),
        updatedAt: publication.updatedAt.getTime(),

        // add the revision to the structure
        revision: publication.revision,

        // this is a flag that denotes whether or not we know that this publication has an attached
        // zip archive on disk.
        attachment,
    };
};

PublicationSchema.statics.projectWith = (
    publication: IPublicationDocument,
    owner: IUserDocument,
) => {
    const { name, title, introduction, draft, owner: ownerId, collaborators } = publication;

    assert(owner.id === ownerId._id.toString(), 'Owner ids mismatch');

    return {
        id: publication.id as string,
        name,
        title,
        introduction,
        owner: User.project(owner),
        draft,

        createdAt: publication.createdAt.getTime(),
        updatedAt: publication.updatedAt.getTime(),

        // add the revision to the structure
        revision: publication.revision,

        // TODO: project collaborators too...
        collaborators,
    };
};

PublicationSchema.statics.projectAsSg = async (
    publication: IPublicationDocument,
): Promise<ExportSgPublication> => {
    const { name, title, introduction, revision, collaborators } = publication;

    // Get the owner and verify that it cannot be null.
    const owner = await User.findById(publication.owner).exec();
    assert(owner !== null);

    const ownerId = User.getExternalId(owner);

    // Project all collaborators into the appropriate id format
    const collaboratorIds = await Promise.all(
        collaborators.map(async (id) => {
            const collaborator = await User.findById(id).exec();
            assert(collaborator !== null);

            return User.getExternalId(collaborator);
        }),
    );

    return {
        name,
        title,
        owner: ownerId,
        introduction: introduction || '',
        revision,
        collaborators: collaboratorIds,
    };
};

export default mongoose.model<IPublication, IPublicationModel>('publication', PublicationSchema);
