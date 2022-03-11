import mongoose, { Document, Model, Schema } from 'mongoose';

import { ExportSgComment, SgComment } from '../validators/sg';
import User, { IUser } from './User';

/** A IComment document represents a comment object */
export interface IComment {
    /** The ID of the publication that this comment refers to. */
    owner: mongoose.ObjectId;
    /** The ID of the review that this comment belongs to. */
    review: mongoose.ObjectId;
    /** The  contents of the comment */
    contents: string;
    /** The filename that the comment is referring to */
    filename?: string;
    /**
     * Anchor represents what lines the comment is referring to in the
     * source code. An anchor cannot exist without a filename existing.
     * The 'start' and 'end' parameters are inclusive, 1-indexed numbers.
     */
    anchor?: {
        start: number;
        end: number;
    };
    /** If the comment is a reply, it has an associated 'replying' ID to another comment */
    replying?: mongoose.ObjectId;
    /** The thread that this comment belongs in */
    thread?: mongoose.ObjectId;
    /**
     * If the comment has been edited before
     * @@Cleanup: We should make this an array to record all the modifications that the user has made */
    edited: boolean;
    /** When the initial document was created */
    createdAt: Date;
    /** When the document was last updated */
    updatedAt: Date;
}

export type AugmentedCommentDocument = Omit<IComment, '_id'> & {
    _id: mongoose.Types.ObjectId;
};

export type PopulatedComment = AugmentedCommentDocument & {
    owner: IUser;
};

interface ICommentDocument extends IComment, Document {}

interface ICommentModel extends Model<ICommentDocument> {
    project: (user: IComment) => Partial<IComment>;
    projectAsSg: (id: number, user: PopulatedComment, replying?: number) => SgComment;
}

const CommentSchema = new Schema<IComment, ICommentModel, IComment>(
    {
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
    const { owner, contents, filename, edited, thread, replying, anchor, review } = comment;

    // If the comment is deleted, we need to do some special projection.

    return {
        id: comment._id,
        author: User.project(owner),
        contents,
        ...(typeof filename !== 'undefined' && { filename }),
        ...(typeof thread !== 'undefined' && { thread }),
        ...(typeof replying !== 'undefined' && { replying }),
        ...(typeof anchor !== 'undefined' && typeof anchor.start !== 'undefined' && { anchor }),
        edited,
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
        ...(typeof anchor !== 'undefined' && typeof anchor.start !== 'undefined' && { anchor }),
        contents,
        author: User.getExternalId(comment.owner),
        postedAt: comment.updatedAt.getTime(),
    };
};

export default mongoose.model<IComment, ICommentModel>('comment', CommentSchema);
