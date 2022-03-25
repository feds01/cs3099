import assert from 'assert';
import mongoose, { Document, Model, Schema } from 'mongoose';

import Comment, { AugmentedCommentDocument } from './Comment';
import { AugmentedPublicationDocument } from './Publication';
import Review from './Review';
import User, { AugmentedUserDocument, IUser } from './User';

/** Type representing a notification document */
export interface INotification {
    /** Whether the notification has been viewed */
    viewed: boolean;
    /** The ID of the user that this notification was created by. */
    author: mongoose.Types.ObjectId;
    /** The ID of the user that this notification was created by. */
    tagging: mongoose.Types.ObjectId;
    /** Comment ID that the tag occurs in */
    comment: mongoose.Types.ObjectId;
    /** When the initial document was created */
    createdAt: Date;
    /** When the document was last updated */
    updatedAt: Date;
    /** If the notification has been marked as live */
    isLive: boolean;
}

interface INotificationDocument extends INotification, Document {}

export type AugmentedNotificationDocument = Omit<INotificationDocument, '_id'> & {
    _id: mongoose.Types.ObjectId;
};

export type PopulatedNotification = AugmentedNotificationDocument & {
    author: IUser;
    tagging: IUser;
};

interface INotificationModel extends Model<INotificationDocument> {
    project: (Notification: PopulatedNotification) => Promise<Partial<INotification>>;
}

const NotificationSchema = new Schema<INotification, INotificationModel, INotification>(
    {
        viewed: { type: Boolean, default: false },
        isLive: { type: Boolean, default: false },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
        tagging: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
        comment: { type: mongoose.Schema.Types.ObjectId, ref: 'comment', required: true },
    },
    { timestamps: true },
);

NotificationSchema.statics.project = async (notification: PopulatedNotification) => {
    const origin: AugmentedCommentDocument | null = await Comment.findById(notification.comment);
    assert(origin !== null);

    // Find the review as we want to return it in the projection
    const review = await Review.findById(origin.review)
        .populate<{ owner: AugmentedUserDocument }>('owner')
        .populate<{ publication: AugmentedPublicationDocument }>('publication')
        .exec();

    assert(review !== null);

    return {
        id: notification._id.toString(),
        commentId: origin._id.toString(),
        tagging: User.project(notification.tagging),
        author: User.project(notification.author),
        review: await Review.project(review),
        updatedAt: notification.updatedAt.getTime(),
        createdAt: notification.createdAt.getTime(),
    };
};

export default mongoose.model<INotification, INotificationModel>(
    'Notification',
    NotificationSchema,
);
