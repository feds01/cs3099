import { strict } from 'assert';
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBookmark {
    user: mongoose.ObjectId;
    publication: mongoose.ObjectId;
}

export interface IBookmarkDocument extends IBookmark, Document {}

interface IBookmarkModel extends Model<IBookmarkDocument> {
    project: (bookmark: IBookmark) => Partial<IBookmark>;
}

const BookmarkSchema = new Schema<IBookmark, IBookmarkModel, IBookmark>(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
        publication: { type: mongoose.Schema.Types.ObjectId, ref: 'publication', required: true },
    },
    { timestamps: true },
);

/**
 * Function to project a bookmark document so that it can be returned as a
 * response in the API.
 *
 * @param bookmark The bookmark Document that is to be projected.
 * @returns A partial bookmark object with selected fields that are to be projected.
 */
BookmarkSchema.statics.project = (bookmark: IBookmarkDocument) => {
    strict.strict(typeof bookmark.id === 'string');

    return {
        user: bookmark.user,
        publication: bookmark.publication,
    };
};

export default mongoose.model<IBookmark, IBookmarkModel>('bookmark', BookmarkSchema);
