import mongoose, { Document, Model, Schema } from 'mongoose';

import Logger from '../common/logger';
import { config } from '../server';
import Follower from './Follower';
import Publication from './Publication';

/**
 * A role represents what level of permissions a user has in the system.
 * All users are assigned a default role which means they can perform actions
 * on resources that they own. The 'moderator' role denotes that a user may
 * modify documents that might not belong to them, but they cannot delete them.
 * An administrator has global access and can perform all actions on the platform.
 */
export enum IUserRole {
    Default = 'default',
    Moderator = 'moderator',
    Administrator = 'administrator',
}

/**
 * The IUser document represents a user object in the system.
 */
export interface IUser {
    /** User unique email */
    email: string;
    /** User unique name */
    username: string;
    /** User password (hashed and salted) */
    password: string;
    /** User optional full name */
    name?: string;
    /** A String determining the location of where the uploaded avatar is. */
    profilePictureUrl?: string;
    /** User permission level */
    role: IUserRole;
    /** User about section */
    about?: string;
    /** User status */
    status?: string;
    /** If this user is external, they will have an associated external id */
    externalId?: string;
    /** When the initial document was created */
    createdAt: Date;
    /** When the document was last updated */
    updatedAt: Date;
}

export interface IUserDocument extends IUser, Document<string> {}

export interface IUserModel extends Model<IUserDocument> {
    project: (user: IUser, omitId?: boolean) => Partial<IUser>;
    projectAsSg: (user: IUser) => { name: string; email: string };
    getExternalId: (user: IUser) => string;
}

const UserSchema = new Schema<IUser, IUserModel, IUser>(
    {
        email: { type: String, required: true, unique: true },
        username: { type: String, required: true, unique: true },
        name: { type: String },
        password: { type: String, default: '' },
        profilePictureUrl: { type: String, required: false },
        about: { type: String },
        status: { type: String },
        externalId: { type: String },
        role: { type: String, enum: IUserRole, default: IUserRole.Default },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    },
);

// Create the text index schema for searching users.
UserSchema.index({ username: 'text', about: 'text', name: 'text', status: 'text' });

/**
 * This function is a hook to remove any comments that are on a review
 * if the publication is marked for deletion.
 */
UserSchema.post(
    /deleteOne|findOneAndDelete$/,
    { document: true, query: true },
    async (item: IUserDocument, next) => {
        Logger.warn('Cleaning up user resources after account deletion');

        const id = item.id as string;
        await Publication.deleteMany({ owner: id }).exec();

        // Now we need to delete any follower entries that contain the current user's id
        await Follower.deleteMany({ $or: [{ following: id }, { follower: id }] }).exec();

        next();
    },
);

/**
 * Function to project a user document so that it can be returned as a
 * response in the API.
 *
 * @param user The user Document that is to be projected.
 * @returns A partial user object with selected fields that are to be projected.
 */
UserSchema.statics.project = (user: IUserDocument, omitId: boolean = false) => {
    const { profilePictureUrl, about, name, status } = user;

    return {
        ...(!omitId && { id: user.id as string }),
        email: user.email,
        username: user.username,
        createdAt: user.createdAt.getTime(),
        role: user.role,
        ...(typeof profilePictureUrl !== 'undefined' && { profilePictureUrl }),
        ...(typeof about !== 'undefined' && { about }),
        ...(typeof status !== 'undefined' && { status }),
        ...(typeof name !== 'undefined' && { name }),
    };
};

UserSchema.statics.getExternalId = (user: IUserDocument): string => {
    if (typeof user.externalId !== 'undefined') {
        return user.externalId;
    }

    return `${user.id as string}:${config.teamName}`;
};

/**
 * Function that projects a user document into the Supergroup format so that it can
 * be returned in responses within Supergroup endpoints.
 *
 * @param user The user Document that is to be projected.
 * @returns A partial user object with selected fields that are to be projected.
 */
UserSchema.statics.projectAsSg = (user: IUserDocument) => {
    const { name, email, profilePictureUrl, username } = user;

    return {
        email,
        name: typeof name !== 'undefined' ? name : username,
        ...(typeof profilePictureUrl !== 'undefined' && { profilePictureUrl }),
    };
};

const UserModel = mongoose.model<IUser, IUserModel>('user', UserSchema);

export default UserModel;
