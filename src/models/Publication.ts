import assert from 'assert';
import mongoose, { Document, Model, Schema } from 'mongoose';

import Logger from '../common/logger';
import { ExportSgPublication } from '../validators/sg';
import Review from './Review';
import User, { IUserDocument } from './User';

/** The publication document represents a publication object */
export interface IPublication {
    /** Revision string of the publication */
    revision?: string;
    /** Owner ID of the publication */
    owner: mongoose.Types.ObjectId;
    /** Publication title */
    title: string;
    /** User unique publication name */
    name: string;
    /** Introduction of the publication */
    introduction?: string;
    /** If the publication is still in draft mode */
    draft: boolean;
    /** If the current revision of the publication is the most current revision */
    current: boolean;
    /** If the publication is pinned on the user's profile page */
    pinned: boolean;
    /** An array of collaborators that are set on the publication */
    collaborators: mongoose.Types.ObjectId[];
    /** When the initial document was created */
    createdAt: Date;
    /** When the document was last updated */
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

// Create the text index schema for searching publications.
PublicationSchema.index({ title: 'text', introduction: 'text', name: 'text' });

/**
 * This function is a hook to remove any reviews that are on a publication
 * if the publication is marked for deletion.
 */
PublicationSchema.post(
    /deleteOne|findOneAndDelete$/,
    { document: true, query: true },
    async (item: IPublicationDocument, next) => {
        Logger.warn('Cleaning up publication orphaned reviews (deleteOne)');
        await Review.deleteMany({ publication: item.id as string }).exec();

        next();
    },
);

PublicationSchema.post(
    'deleteMany',
    { document: true, query: true },
    async (_: unknown, items: IPublicationDocument[], next: () => void) => {
        Logger.warn('Cleaning up publication orphaned reviews (deleteMany)');

        await Promise.all(
            items.map(async (item) => {
                await Review.deleteMany({ publication: item.id as string }).exec();
            }),
        );

        next();
    },
);

PublicationSchema.statics.project = async (
    publication: IPublicationDocument,
    attachment?: boolean,
) => {
    const { name, title, introduction, draft, owner: ownerId, collaborators } = publication;

    // If the comment is deleted, we need to do some special projection.

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

        // If the publication is the current version or not
        current: publication.current,

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

        // If the publication is the current version or not
        current: publication.current,

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
        introduction: introduction ?? '',
        revision,
        collaborators: collaboratorIds,
    };
};

const PublicationModel = mongoose.model<IPublication, IPublicationModel>(
    'publication',
    PublicationSchema,
);
PublicationModel.createIndexes();

export default PublicationModel;
