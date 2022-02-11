import { config } from '../server';
import { strict } from 'assert';
import mongoose, { Document, Model, Schema } from 'mongoose';

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
    /** User first name */
    firstName: string;
    /** User last name */
    lastName: string;
    /** User profile picture url */
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
    /** If the document is 'deleted' */
    isDeleted: boolean;
}

export interface IUserDocument extends IUser, Document<string> { }

export interface IUserModel extends Model<IUserDocument> {
    project: (user: IUser, omitId?: boolean) => Partial<IUser>;
    projectAsSg: (user: IUser) => { name: string; email: string };
    getExternalId: (user: IUser) => string;
}

const UserSchema = new Schema<IUser, IUserModel, IUser>(
    {
        email: { type: String, required: true, unique: true },
        username: { type: String, required: true, unique: true },
        firstName: { type: String, required: true, minLength: 1 },
        lastName: { type: String, required: true, minLength: 1 },
        password: { type: String, default: '' },
        profilePictureUrl: { type: String },
        about: { type: String },
        status: { type: String },
        externalId: { type: String },
        role: { type: String, enum: IUserRole, default: IUserRole.Default },
        isDeleted: { type: Boolean, default: false }
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
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
    const { profilePictureUrl, about, status } = user;

    strict.strict(typeof user.id === 'string');

    return {
        ...(!omitId && { id: user.id }),
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt.getTime(),
        ...(typeof profilePictureUrl !== 'undefined' && { profilePictureUrl }),
        ...(typeof about !== 'undefined' && { about }),
        ...(typeof status !== 'undefined' && { status }),
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
    const { firstName, lastName, email, profilePictureUrl } = user;

    return {
        name: `${firstName} ${lastName}`,
        email,
        ...(typeof profilePictureUrl !== 'undefined' && { profilePictureUrl }),
    };
};

export default mongoose.model<IUser, IUserModel>('user', UserSchema);
