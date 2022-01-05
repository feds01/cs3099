import mongoose, { Document, Model, Schema } from 'mongoose';
import { ExportSgComment, SgComment } from '../validators/sg';
import User, { IUser } from './User';

export interface IComment {
    publication: mongoose.ObjectId;
    owner: mongoose.ObjectId;
    contents: string;
    review: mongoose.ObjectId;
    filename?: string;
    anchor?: {
        start: number;
        end: number;
    };
    replying?: mongoose.ObjectId;
    thread?: mongoose.ObjectId;
    edited: boolean;
    createdAt: Date;
    updatedAt: Date;
}

type PopulatedComment = (IComment & {
    _id: any;
}) & {
    owner: IUser;
};

interface ICommentDocument extends IComment, Document { }

interface ICommentModel extends Model<ICommentDocument> {
    project: (user: IComment) => Partial<IComment>;
    projectAsSg: (id: number, user: PopulatedComment) => SgComment;
}

const CommentSchema = new Schema<IComment, ICommentModel, IComment>(
    {
        publication: { type: mongoose.Schema.Types.ObjectId, ref: 'publication', required: true },
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
        contents: { type: String, required: true },
        thread: { type: mongoose.Schema.Types.ObjectId, required: false },
        replying: { type: mongoose.Schema.Types.ObjectId, ref: 'comment', required: false },
        edited: { type: Boolean, default: false },
        anchor: {
            start: { type: Number },
            end: { type: Number },
        },
        filename: { type: String },
        review: { type: mongoose.Schema.Types.ObjectId, ref: 'review' },
    },
    { timestamps: true },
);

/**
 * Function to project a user comment so that it can be returned as a
 * response in the API.
 *
 * @param comment The comment Document that is to be projected.
 * @returns A partial comment object with selected fields that are to be projected.
 */
CommentSchema.statics.project = (comment: PopulatedComment) => {
    const { publication, owner, contents, filename, edited, thread, replying, anchor, review } = comment;

    return {
        publication,
        author: User.project(owner), // @@Cleanup: change this to being owner??
        contents,
        ...(typeof filename !== 'undefined' && { filename }),
        ...(typeof thread !== 'undefined' && { thread }),
        ...(typeof replying !== 'undefined' && { replying }),
        edited,
        anchor,
        review,
        createdAt: comment.createdAt.getTime(),
        updatedAt: comment.updatedAt.getTime(),
    };
};

/**
 * Function that projects a user document into the Supergroup format so that it can
 * be returned in responses within Supergroup endpoints.
 *
 * @param user The user Document that is to be projected.
 * @returns A partial user object with selected fields that are to be projected.
 */
CommentSchema.statics.projectAsSg = (
    id: number,
    comment: PopulatedComment,
    replying?: number,
): ExportSgComment => {
    const { filename, anchor, contents } = comment;

    return {
        id,
        replying,
        ...(typeof filename !== 'undefined' && { filename }),
        anchor,
        contents,
        author: User.getExternalId(comment.owner),
        postedAt: comment.updatedAt.getTime(),
    };
};

export default mongoose.model<IComment, ICommentModel>('comment', CommentSchema);
