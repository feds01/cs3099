import { Comment, CommentAnchor } from '../api/models';

export type CommentThread = {
    comments: Comment[];
    file?: string;
    anchor?: CommentAnchor;
    id: string;
};


/**
 * 
 * @param comments 
 * @returns 
 */
export function sortCommentsIntoThreads(comments: Comment[]): Map<string, CommentThread> {
    // first create a default map that maps threads to comments...
    const commentThreads = new Map<string, CommentThread>();

    comments.forEach((comment) => {
        if (commentThreads.has(comment.thread)) {
            let thread = commentThreads.get(comment.thread)!;

            thread.comments.push(comment);

            // @@Cleanup: is this even necessary?
            if (typeof thread.file === 'undefined' || typeof thread.anchor === 'undefined') {
                if (typeof comment.replying === 'undefined') {
                    thread = {
                        ...thread,
                        file: comment.filename,
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
                    file: comment.filename,
                    anchor: comment.anchor,
                }),
            });
        }
    });

    return commentThreads;
}

/**
 * 
 * @param commentThreads 
 */
export function sortCommentsIntoFileMap(commentThreads: Map<string, CommentThread>): Map<string, CommentThread[]> {
    const fileMap = new Map<string, CommentThread[]>();

    // now sort the threads by file/general...
    for (const thread of commentThreads.values()) {
        if (typeof thread.file === 'string') {
            if (fileMap.has(thread.file)) {
                const originalArr = fileMap.get(thread.file)!;
                originalArr.push(thread);
            } else {
                fileMap.set(thread.file, [thread]);
            }
        }
    }

    return fileMap;
}

/**
 * 
 * @param commentThreads 
 * @returns 
 */
export function extractGeneralCommentsFromThreads(commentThreads: Map<string, CommentThread>): CommentThread[] {
    const generalComments = [];

    for (const thread of commentThreads.values()) {
        if (typeof thread.file !== 'string') {
            generalComments.push(thread)
        }
    }

    return generalComments;
}
