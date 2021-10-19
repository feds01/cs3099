import mongoose, { Document, Model, ObjectId, Schema } from 'mongoose';
import { string } from 'zod';

export interface IComment {
    submission: mongoose.ObjectId;
    owner: mongoose.ObjectId;
    content: string;
    review: mongoose.ObjectId;
    replying?: mongoose.ObjectId;
    thread?: mongoose.ObjectId;
}

interface ICommentDocument extends IComment, Document {}

interface ICommentModel extends Model<ICommentDocument> {
}

const CommentSchema = new Schema<IComment, ICommentModel, IComment>(
    {
        submission: {type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true},
        owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
        content: {type: String, required: true},
        thread: {type: mongoose.Schema.Types.ObjectId, required: false},
        replying: {type: mongoose.Schema.Types.ObjectId, ref: 'Comment', required: false},
        review: {type: mongoose.Schema.Types.ObjectId, ref: 'Review'}
    },
    { timestamps: true },
);

export default mongoose.model<IComment, ICommentModel>('comment', CommentSchema);
