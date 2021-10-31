import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IComment {
    publication: mongoose.ObjectId;
    owner: mongoose.ObjectId;
    content: string;
    review: mongoose.ObjectId;
    replying?: mongoose.ObjectId;
    thread?: mongoose.ObjectId;
}

interface ICommentDocument extends IComment, Document {}

interface ICommentModel extends Model<ICommentDocument> {}

const CommentSchema = new Schema<IComment, ICommentModel, IComment>(
    {
        publication: { type: mongoose.Schema.Types.ObjectId, ref: 'publication', required: true },
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
        content: { type: String, required: true },
        thread: { type: mongoose.Schema.Types.ObjectId, required: false },
        replying: { type: mongoose.Schema.Types.ObjectId, ref: 'comment', required: false },
        review: { type: mongoose.Schema.Types.ObjectId, ref: 'review' },
    },
    { timestamps: true },
);

export default mongoose.model<IComment, ICommentModel>('comment', CommentSchema);
