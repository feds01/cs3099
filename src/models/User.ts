import { strict } from 'assert';
import mongoose, { Document, Model, Schema } from 'mongoose';

export enum IUserRole {
    Default = 'default',
    Moderator = 'moderator',
    Administrator = 'administrator',
}

export interface IUser {
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    profilePictureUrl?: string;
    role: IUserRole;
    about?: string;
    status?: string;
    externalId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserDocument extends IUser, Document<string> {}

export interface IUserModel extends Model<IUserDocument> {
    project: (user: IUser, omitId?: boolean) => Partial<IUser>;
    projectAsSg: (user: IUser) => { name: string; email: string };
}

const UserSchema = new Schema<IUser, IUserModel, IUser>(
    {
        email: { type: String, required: true, unique: true },
        username: { type: String, required: true, unique: true },
        firstName: { type: String, required: true, minLength: 1 },
        lastName: { type: String, required: true, minLength: 1 },
        password: { type: String, required: true },
        profilePictureUrl: { type: String },
        about: { type: String },
        status: { type: String },
        externalId: { type: String },
        role: { type: String, enum: IUserRole, default: IUserRole.Default },
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
