import mongoose from 'mongoose';

import Logger from '../../common/logger';
import Notification from '../../models/Notification';
import User, { AugmentedUserDocument } from '../../models/User';
import { expr } from '../../utils/expr';

/** User mention syntax Regular expression */
const MENTION_REGEX = /@(?<username>[a-zA-Z0-9._~-]+)/;

/**
 * Utility method to find all user mentions within a content string, we
 * use the username regex to find any references in the form of `@username`
 * and then return a set of those from the content.
 *
 * @param content - The content string
 * @returns A set of mentions within the content string
 */
export function findUserMentions(content: string): Set<string> {
    const userMentions = new Set<string>();

    for (const name of content.matchAll(new RegExp(MENTION_REGEX, 'g'))) {
        if (typeof name.groups !== 'undefined' && 'username' in name.groups) {
            const username = name.groups.username!;

            if (!userMentions.has(username)) {
                userMentions.add(username);
            }
        }
    }

    return userMentions;
}

/**
 * Method to check whether a notification should be added for the current context.
 * It checks for the given constraints to be fulfilled before adding a notification:
 *
 *  - A user exists with the tagged username
 *
 *  - The tagged user is not the author of the tag
 *
 *  - The tagged user has not been tagged in the review already (that they have seen)
 *
 *  - If there is already a tag in a comment that exists ( this is important if a comment
 *    document has been patched) as we don't want to add multiple notifications for users
 *    being re-tagged in already existant documents.
 *
 * @param tagging - The username that is being tagged
 * @param review - The review ID that the tag is occurring in
 * @param comment - The comment ID the tag is occurring in
 * @param author - The author of the tag.
 * @returns
 */
async function notificationMeetsCondition(
    tagging: string,
    review: mongoose.Types.ObjectId,
    comment: mongoose.Types.ObjectId,
    author: AugmentedUserDocument,
): Promise<AugmentedUserDocument | null> {
    const taggingUser = await expr(async () => {
        if (author.username === tagging) {
            return author;
        } else {
            return (await User.findOne({
                username: tagging,
            }).exec()) as unknown as AugmentedUserDocument | null;
        }
    });

    // If we cannot find the tagged user, about
    if (!taggingUser || taggingUser._id.toString() === author.toString()) {
        return null;
    }

    // Check if the user has already been tagged in the same comment
    // Check if the user has already been tagged within the review (and it hasn't been seen)
    const alreadyTagged = await Notification.findOne({
        $or: [
            {
                tagging: taggingUser._id,
                review: review,
                author: author,
                viewed: false,
            },
            {
                tagging: taggingUser._id,
                comment,
            },
        ],
    }).exec();

    return alreadyTagged === null ? taggingUser : null;
}

/**
 * Method to begin the process of creating a notification for a user.
 *
 * @param tagging - The username of the tagged user
 * @param review - The review of where the tagging occurs
 * @param author - The tagger
 * @param comment - The comment ID where the tagging occurs
 * @param markAsLive - Whether to immediately mark the notification as live
 * @returns Whether the initial process of creating the notification was successful.
 */
export async function createNotification(
    tagging: string,
    review: mongoose.Types.ObjectId,
    author: AugmentedUserDocument,
    comment: mongoose.Types.ObjectId,
    markAsLive: boolean,
): Promise<void> {
    const taggedUser = await notificationMeetsCondition(tagging, review, comment, author);
    if (!taggedUser) return;

    try {
        await new Notification({
            comment: comment,
            tagging: taggedUser._id,
            author: author,
            isLive: markAsLive,
            viewed: false,
        }).save();
    } catch (e: unknown) {
        if (e instanceof Error) {
            Logger.warn(`Failed saving a notification:\n${e.stack}`);
        } else {
            Logger.warn('Failed saving a notification.');
        }
    }
}

/**
 * Method to find all 'notifications' that are marked as not live that are on a
 * particular review
 *
 * @param review - The ID of the review to mark all notifications as live
 */
export async function markNotificationsAsLive(review: mongoose.Types.ObjectId): Promise<void> {
    await Notification.updateMany({ review, isLive: false }, { $set: { isLive: true } }).exec();
}
