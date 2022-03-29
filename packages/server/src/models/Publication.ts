import assert from 'assert';
import mongoose, { Document, Model, Schema } from 'mongoose';

import Logger from '../common/logger';
import { ExportSgPublication } from '../validators/sg';
import Review, { IReviewStatus } from './Review';
import User, { AugmentedUserDocument, IUser, IUserDocument, TransformedUser } from './User';

/** The publication document represents a publication object */
export interface IPublication {
    /** Revision string of the publication */
    revision: string;
    /** Owner ID of the publication */
    owner: mongoose.Types.ObjectId;
    /** Publication title */
    title: string;
    /** User unique publication name */
    name: string;
    /** Introduction of the publication */
    introduction?: string;
    /** Information about the current revision (potentially specifying what changed between revisions) */
    changelog?: string;
    /** Short about section of what the publication is off */
    about?: string;
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

/** Internal type that represents a project publication that is sent to the requester */
export interface TransformedPublication {
    /** The internal id of the publication */
    id: string;
    revision: string;
    owner: TransformedUser;
    title: string;
    name: string;
    introduction?: string;
    changelog?: string;
    about?: string;
    draft: boolean;
    current: boolean;
    pinned: boolean;
    collaborators: TransformedUser[];
    createdAt: number;
    updatedAt: number;
    /** Whether the system knows or not that the publication has sources */
    attachment?: boolean;
    /** Number of reviews on the publication */
    reviews: number;
}

export interface IPublicationDocument extends IPublication, Document {}

export type AugmentedPublicationDocument = Omit<IPublicationDocument, '_id'> & {
    _id: mongoose.Types.ObjectId;
};

export type PopulatedPublication = AugmentedPublicationDocument & {
    owner: IUser;
};

interface IPublicationModel extends Model<IPublicationDocument> {
    project: (
        publication: AugmentedPublicationDocument,
        attachment?: boolean,
    ) => Promise<TransformedPublication>;
    projectWith: (
        publication: AugmentedPublicationDocument,
        user: IUserDocument | AugmentedUserDocument,
    ) => Promise<TransformedPublication>;
    projectAsSg: (publication: IPublicationDocument) => Promise<ExportSgPublication>;
}

const PublicationSchema = new Schema<IPublication, IPublicationModel, IPublication>(
    {
        revision: { type: String, required: true },
        name: { type: String, required: true },
        title: { type: String, required: true },
        introduction: { type: String },
        changelog: { type: String },
        about: { type: String },
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
    /remove|deleteOne|findOneAndDelete$/,
    { document: true, query: true },
    async (item: AugmentedPublicationDocument | null, next) => {
        if (item === null) return next();
        Logger.warn('Cleaning up publication orphaned reviews (deleteOne)');

        const reviews = await Review.find({ publication: item._id.toString() }).exec();

        // @@Bug: Mongoose doesn't seem to fire the `deleteMany` hook when we use
        //        the `Review.deleteMany(...)` call. Specifically, defining the .post()
        //        with accepting the query result, deleted items and the next() function.
        //
        //        Oddly enough, this post hook definition does work for this Publication
        //        schema as it is defined below.
        await Promise.all(
            reviews.map(async (review) => {
                await review.deleteOne();
            }),
        );

        next();
    },
);

PublicationSchema.post(
    'deleteMany',
    { document: true, query: true },
    async (_: unknown, items: AugmentedPublicationDocument[], next: () => void) => {
        Logger.warn('Cleaning up publication orphaned reviews (deleteMany)');

        await Promise.all(
            items.map(async (item) => {
                await Review.deleteMany({ publication: item._id.toString() }).exec();
            }),
        );

        next();
    },
);

PublicationSchema.statics.project = async (
    publication: AugmentedPublicationDocument,
    attachment?: boolean,
): Promise<TransformedPublication> => {
    const { name, title, introduction, changelog, about, draft, owner: ownerId } = publication;

    // Resolve the owner name...
    const owner = await User.findById(ownerId).exec();
    assert(owner !== null, 'Owner ID is null');

    // Project all the collaborators
    const collaborators = await Promise.all(
        publication.collaborators.map(async (id) => {
            const collaborator = await User.findById(id.toString()).exec();
            assert(collaborator !== null);

            return User.project(collaborator);
        }),
    );

    // We want to count the number of reviews that have been left on this publication
    const reviews = await Review.count({
        publication: publication._id.toString(),
        status: IReviewStatus.Completed,
    }).exec();

    return {
        id: publication._id.toString(),
        name,
        title,
        introduction,
        changelog,
        about,
        owner: User.project(owner),
        pinned: publication.pinned,
        draft,
        createdAt: publication.createdAt.getTime(),
        updatedAt: publication.updatedAt.getTime(),
        revision: publication.revision,
        current: publication.current,
        // Any collaborators that are attached to the publication
        collaborators,
        // Count of reviews that have been left on the publication
        reviews,
        // this is a flag that denotes whether or not we know that this publication has an attached
        // zip archive on disk.
        attachment,
    };
};

PublicationSchema.statics.projectWith = async (
    publication: AugmentedPublicationDocument,
    owner: IUserDocument,
): Promise<TransformedPublication> => {
    const {
        name,
        title,
        introduction,
        pinned,
        about,
        changelog,
        draft,
        owner: ownerId,
    } = publication;

    assert(owner.id === ownerId._id.toString(), 'Owner ids mismatch');

    // Project all the collaborators
    const collaborators = await Promise.all(
        publication.collaborators.map(async (id) => {
            const collaborator = await User.findById(id).exec();
            assert(collaborator !== null);

            return User.project(collaborator);
        }),
    );

    // We want to count the number of reviews that have been left on this publication
    const reviews = await Review.count({
        publication: publication._id.toString(),
        status: IReviewStatus.Completed,
    }).exec();

    return {
        id: publication._id.toString(),
        name,
        title,
        about,
        introduction,
        changelog,
        owner: User.project(owner),
        draft,
        pinned,
        createdAt: publication.createdAt.getTime(),
        updatedAt: publication.updatedAt.getTime(),
        revision: publication.revision,
        current: publication.current,
        // Any collaborators that are attached to the publication
        collaborators,
        // Count of reviews that have been left on the publication
        reviews,
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

export default PublicationModel;
