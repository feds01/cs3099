import { Comment, CommentAnchor } from '../api/models';

/**
 * Type representing a comment thread. This type is used to group comments that
 * belong to the same thread.
 */
export type CommentThread = {
    /** All the comments in the thread */
    comments: Comment[];
    /** Shared filename if any */
    filename?: string;
    /** Shared source anchor if any */
    anchor?: CommentAnchor;
    /** The id of the thread */
    id: string;
};

/**
 * This function is used to sort an array of comments into a hash map that represents a mapping
 * between a thread id and the comment. It collects comments into lists that are associative to
 * their thread. This is done so that they can be rendered by a singular component and provide
 * additional styling in regards to the thread.
 *
 * @param comments - List of comments to be sorted using the comment thread id
 * @returns A mapping between a thread id and its comments.
 */
export function sortCommentsIntoThreads(comments: Comment[]): Map<string, CommentThread> {
    // first create a default map that maps threads to comments...
    const commentThreads = new Map<string, CommentThread>();

    comments.forEach((comment) => {
        if (commentThreads.has(comment.thread)) {
            let thread = commentThreads.get(comment.thread)!;

            thread.comments.push(comment);

            // @@Cleanup: is this even necessary?
            if (typeof thread.filename === 'undefined' || typeof thread.anchor === 'undefined') {
                if (typeof comment.replying === 'undefined') {
                    thread = {
                        ...thread,
                        filename: comment.filename,
                        anchor: comment.anchor,
                    };

                    commentThreads.set(comment.thread, thread);
                }
            }
        } else {
            commentThreads.set(comment.thread, {
                comments: [comment],
                id: comment.id,
                ...(typeof comment.replying === 'undefined' && {
                    filename: comment.filename,
                    anchor: comment.anchor,
                }),
            });
        }
    });

    return commentThreads;
}

/**
 * This function is used to sort comments by their filenames into a map representing the filename and comment
 * threads. The function takes in a map of thread ids to comment threads. It will create a new map representing
 * the threads and their associative files
 *
 * @param commentThreads The map representing sorted comments by thread id
 * @returns A map of comment threads to filenames
 */
export function sortCommentsIntoFileMap(commentThreads: Map<string, CommentThread>): Map<string, CommentThread[]> {
    const fileMap = new Map<string, CommentThread[]>();

    // now sort the threads by file/general...
    for (const thread of commentThreads.values()) {
        if (typeof thread.filename === 'string') {
            if (fileMap.has(thread.filename)) {
                const originalArr = fileMap.get(thread.filename)!;
                originalArr.push(thread);
            } else {
                fileMap.set(thread.filename, [thread]);
            }
        }
    }

    return fileMap;
}

/**
 * This function will take any comment threads that have no associative file or file source as these
 * comments need to be handled separately from files
 *
 * @param commentThreads The map representing sorted comments by thread id
 * @returns A list of general comment threads.
 */
export function extractGeneralCommentsFromThreads(commentThreads: Map<string, CommentThread>): CommentThread[] {
    const generalComments = [];

    for (const thread of commentThreads.values()) {
        if (typeof thread.filename !== 'string') {
            generalComments.push(thread);
        }
    }

    return generalComments;
}
