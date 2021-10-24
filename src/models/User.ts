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
}

interface IUserDocument extends IUser, Document {}

interface IUserModel extends Model<IUserDocument> {
    project: (user: IUser) => Partial<IUser>;
}

const UserSchema = new Schema<IUser, IUserModel, IUser>(
    {
        email: { type: String, required: true, unique: true },
        username: { type: String, required: true, unique: true },
        firstName: { type: String, required: true, minLength: 1 },
        lastName: { type: String, required: true, minLength: 1 },
        password: { type: String, required: true, minLength: 12 },
        profilePictureUrl: { type: String },
        about: { type: String },
        status: { type: String },
        externalId: { type: String },
        role: { type: String, enum: IUserRole, default: IUserRole.Default },
    },
    { timestamps: true },
);

/**
 * Function to project a user document so that it can be returned as a
 * response in the API.
 *
 * @param user The user Document that is to be projected.
 * @returns A partial user object with selected fields that are to be projected.
 */
UserSchema.statics.project = function (user: IUserDocument) {
    const { profilePictureUrl, about, status } = user;

    return {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        ...(profilePictureUrl && { profilePictureUrl }),
        ...(about && { about }),
        ...(status && { status }),
    };
};

export default mongoose.model<IUser, IUserModel>('user', UserSchema);
