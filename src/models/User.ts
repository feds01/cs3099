import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUser {
    email: string;
    username: string;
    password: string;
    // image: boolean,
}

interface IUserDocument extends IUser, Document {}

interface IUserModel extends Model<IUserDocument> {
    project: (user: IUser) => Partial<IUser>;
}

const UserSchema = new Schema<IUser, IUserModel, IUser>(
    {
        email: { type: String, required: true, unique: true },
        username: { type: String, required: false, unique: true },
        password: { type: String, required: true, minLength: 12 },
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
    return {
        id: user._id,
        email: user.email,
        username: user.username,
    };
};

export default mongoose.model<IUser, IUserModel>('user', UserSchema);
