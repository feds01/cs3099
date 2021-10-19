import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFollower {
    follower: mongoose.ObjectId;
    following: mongoose.ObjectId;
}

interface IFollowerDocument extends IFollower, Document {}

interface IFollowerModel extends Model<IFollowerDocument> {
}

const FollowerSchema = new Schema<IFollower, IFollowerModel, IFollower>(
    {
        follower: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        following: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    },
    { timestamps: true },
);


export default mongoose.model<IFollower, IFollowerModel>('follower', FollowerSchema);
