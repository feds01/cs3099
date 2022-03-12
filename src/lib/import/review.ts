import AdmZip from 'adm-zip';
import assert from 'assert';
import mongoose from 'mongoose';

import * as file from '../../lib/resources/file';
import Logger from '../../common/logger';
import Comment from '../../models/Comment';
import { AugmentedPublicationDocument } from '../../models/Publication';
import Review, { IReviewStatus } from '../../models/Review';
import { reduceToDuplicates } from '../../utils/array';
import { expr } from '../../utils/expr';
import { SgComment, SgReview, SgUserId } from '../../validators/sg';
import { UserImportStatus, importUser } from './user';

export type SgCommentIssue = Record<keyof SgComment, string[]>;

type ReviewImportVerificationStatus<T> =
    | {
          status: 'error';
          message: string;
          issues: Record<number, SgCommentIssue>;
      }
    | ({
          status: 'ok';
      } & T extends never
          ? { status: 'ok' }
          : { status: 'ok'; data: T });

export type ReviewImportIssues = Omit<
    Extract<ReviewImportVerificationStatus<unknown>, { status: 'error' }>,
    'status'
>;

/**
 * The @see ReviewImportManager is class that contains all the logic that validates, pre-processes
 * and finally imports a foreign import. This class also contains logic for reporting on why
 * a review/comments/authors within a review might be invalid.
 */
export class ReviewImportManager {
    /**
     * This denotes all of the comments that failed to be imported when trying to import them.
     * The key of the map denotes the id of the comment thread that couldn't be imported, and the
     * array of numbers are the localised ids of comments that couldn't be imported in the thread.
     */
    validComments: Set<number>;

    /** A map of id to comment for ease of use and faster lookups. */
    readonly commentMap: Map<number, SgComment>;

    /** If the review has been validated */
    isValidated: boolean = false;

    /**
     * This represents all of the comment threads that are to be created as a result of pre-processing
     * the given @see SgReview
     */
    commentThreads: Set<number>[] = [];

    /** A set of author ids that will need to be imported when the review is going to be saved.  */
    authors: Map<SgUserId, string | undefined> = new Map();

    /** Issues that arose when validating or committing the comment */
    commentIssues: Map<number, SgCommentIssue> = new Map();

    constructor(
        readonly ownerId: string,
        readonly publication: AugmentedPublicationDocument,
        readonly review: SgReview,
        readonly archive: AdmZip,
    ) {
        this.validComments = new Set([...this.review.comments.map((comment) => comment.id)]);
        this.commentMap = new Map(this.review.comments.map((value, idx) => [idx, value]));
    }

    /** Helper function to exit early in certain conditions and produce an error report... */
    fail(message: string): Extract<ReviewImportVerificationStatus<never>, { status: 'error' }> {
        return {
            status: 'error',
            message,
            issues: Object.fromEntries(this.commentIssues),
        };
    }

    /**
     * Function to add an issue to the @see commentIssues data structure
     *
     * @param id - The Id of the comment that the issue will be appended to
     * @param issue - The issue string
     */
    private addCommentIssue(id: number, field: keyof SgComment, issue: string) {
        const issues = this.commentIssues.get(id) ?? ({} as SgCommentIssue);
        issues[field] = typeof issues[field] !== 'undefined' ? [...issues[field], issue] : [issue];

        this.commentIssues.set(id, issues);
    }

    /**
     * Function to perform basic validation on the structural integrity of the review data.
     *
     * @returns Whether or not the review is valid.
     */
    validate(): ReviewImportVerificationStatus<never> {
        // if the size of the idSet is not equal to the length of comments, this means that
        // the provided comment set is invalid and the entire review import should fail
        if (this.validComments.size !== this.review.comments.length) {
            // we want to add 'issues' to the comment issues...
            const duplicates = reduceToDuplicates(this.review.comments.map((c) => c.id));

            duplicates.forEach((dup) => {
                this.addCommentIssue(dup, 'id', 'Non-unique identifier');
            });

            return this.fail('Comments have non-unique ids');
        }

        // Now check that for every comment that specifies the 'replying' field, a complementary
        // comment with that id is provided.
        const toInvalidate = new Set<number>();

        this.review.comments.forEach((comment) => {
            if (typeof comment.replying !== 'undefined') {
                if (!this.validComments.has(comment.replying)) {
                    this.addCommentIssue(comment.id, 'replying', 'Non-existant id reference');
                    toInvalidate.add(comment.id);
                }

                // A comment cannot reply to itself
                if (comment.replying === comment.id) {
                    this.addCommentIssue(comment.id, 'replying', 'Comment cannot reply to self');
                    toInvalidate.add(comment.id);
                }

                // Invalidate any comments that have invalid references too
                if (toInvalidate.has(comment.replying)) {
                    this.addCommentIssue(
                        comment.id,
                        'replying',
                        'Comment is replying to malformed comment',
                    );
                    toInvalidate.add(comment.id);
                }
            }

            // Here we check that if the comment has a file, and anchor that they make sense
            if (typeof comment.filename !== 'undefined') {
                const entry = this.archive.getEntry(comment.filename);

                if (!entry) {
                    this.addCommentIssue(
                        comment.id,
                        'filename',
                        'Archive contains no such file entry',
                    );
                    toInvalidate.add(comment.id);
                } else if (typeof comment.anchor !== 'undefined') {
                    const { start, end } = comment.anchor;

                    const lines = file.countLines(entry.getData().toString());

                    // end + 1 is allowed since it might cover the last line and thus the anchor becomes ranged
                    // to the last line and the the last line + 1
                    if (start > lines || end > lines + 1) {
                        this.addCommentIssue(
                            comment.id,
                            'anchor',
                            `Invalid anchor range, valid range is 0-${lines}, given range is ${start}-${end}`,
                        );
                        toInvalidate.add(comment.id);
                    }
                }
            }
        });

        // Subtract all of the ids that are to be invalidated from the idSet.
        this.invalidateComments(toInvalidate);

        // If all the comments are invalid, then we have to abort the import process
        if (this.validComments.size === 0) {
            return this.fail('All comments are invalid');
        }

        this.isValidated = true;

        return { status: 'ok' };
    }

    /**
     * This method is used to build a relational structure which identifies all the comment
     * threads that exist within the review. This can be done by checking if the 'replying'
     * id field is present within an existing thread, if it is, then the comment id is placed
     * into that map.
     *  */
    constructCommentThreads() {
        assert(this.isValidated);

        // Clear the threads since there might be old ones there...
        this.commentThreads = [];

        this.validComments.forEach((value) => {
            const comment = this.commentMap.get(value);
            if (typeof comment === 'undefined') return;

            if (typeof comment.replying !== 'undefined') {
                for (const thread of this.commentThreads) {
                    if (thread.has(comment.replying)) {
                        thread.add(comment.id);
                    }
                }
            } else {
                this.commentThreads.push(new Set([comment.id])); // Create a new thread...
            }
        });
    }

    /**
     * Function to invalidate a set of comments and update the validComments map...
     */
    private invalidateComments(toInvalidate: Set<number>) {
        this.validComments = new Set([...this.validComments].filter((id) => !toInvalidate.has(id)));
    }

    /**
     * Function to determine all of the authors that are to be imported for the review.
     */
    computeAuthors() {
        assert(this.isValidated);

        this.authors = new Map(
            [...this.validComments].map((value) => {
                const comment = this.commentMap.get(value);
                assert(typeof comment !== 'undefined');

                return [comment.author, undefined];
            }),
        );
    }

    /**
     * Function that performs validation, pre-processing and then a database transaction to
     * commit the content that the review has attached to the database.
     *
     * @returns
     */
    async save(): Promise<ReviewImportVerificationStatus<undefined>> {
        const validation = this.validate();

        if (validation.status === 'error') {
            return validation;
        }

        this.computeAuthors();
        const importedUsers = await this.importReferences();

        if (importedUsers.status === 'error') {
            return importedUsers;
        }

        // So now that we are sure that all the users we need are imported, and
        // that all the comments have been validated, we can now start creating
        // documents that represent the comments and review, and save any users
        // that we need to.
        const transaction = await mongoose.startSession();

        try {
            // Save any users we need to...
            for (const user of importedUsers.data.values()) {
                await user.doc.save();
            }

            const review = new Review({
                publication: this.publication._id.toString(),
                owner: this.ownerId,
                status: IReviewStatus.Completed,
            });
            await review.save();

            // Now we need to iterate over threads and create all of the comments
            for (const thread of this.commentThreads) {
                const threadComments = [...thread.values()].map((id) => {
                    return this.commentMap.get(id)!;
                });

                // Sort the comments in the thread by reference order. The way we do this
                // is so identify the 'root' comment in the thread and then commit it, save
                // it to the comment map. Then, we identify all comments that are replying
                // to the root comment and commit those, then find all comments that reference
                // those comments and so on. Once no comments are left to be assigned as references
                // then we exit.
                const commentCommitOrder = [];

                // Find the initial comment
                const initialComments = threadComments.filter(
                    (comment) => typeof comment.replying === 'undefined',
                );

                // @@Cleanup: This shouldn't happen at all due to how constructCommentThreads() works
                assert(initialComments.length === 1);
                const rootComment = initialComments[0]!;

                commentCommitOrder.push(rootComment.id);

                // Now find all the comments that reference the previous batch
                const leftComments = new Set(threadComments.keys());
                leftComments.delete(rootComment.id);

                let previousReferences = [rootComment.id];
                let nextReferences = [];

                while (leftComments.size !== 0) {
                    for (const ref of previousReferences) {
                        for (const commentId of leftComments.values()) {
                            const comment = this.commentMap.get(commentId)!;
                            assert(typeof comment.replying !== 'undefined');

                            if (comment.replying === ref) {
                                nextReferences.push(comment.id);
                                leftComments.delete(comment.id);
                            }
                        }
                    }

                    commentCommitOrder.push(...nextReferences);
                    previousReferences = nextReferences;
                }

                // The shared thread id that's to be used in the comments
                const threadId = new mongoose.Types.ObjectId();

                // This map represents the mapping between the ids used in the
                // exported review and the created ids that have been assigned to
                // the comment object. We have to keep a track of this because we have
                // to fill in all the 'replying' fields with referenced mongo ids.
                const commentMap = new Map<number, mongoose.Types.ObjectId>();

                // Now commit the comments
                for (const commentId of commentCommitOrder) {
                    const comment = this.commentMap.get(commentId);
                    assert(typeof comment !== 'undefined');

                    const owner = importedUsers.data.get(comment.author);
                    assert(typeof owner !== 'undefined' && typeof owner.doc._id !== 'undefined');

                    const replying = expr(() => {
                        if (typeof comment.replying !== 'undefined') {
                            const id = commentMap.get(comment.replying);
                            assert(typeof id !== 'undefined');
                            return id;
                        } else {
                            return undefined;
                        }
                    });

                    const doc = new Comment({
                        owner: owner.doc._id.toString(),
                        review: review._id.toString(),
                        contents: comment.contents,
                        filename: comment.filename,
                        anchor: comment.anchor,
                        thread: threadId,
                        createdAt: comment.postedAt,
                        replying,
                    });

                    await doc.save();
                    commentMap.set(comment.id, doc._id);
                }
            }

            await transaction.commitTransaction();
        } catch (e: unknown) {
            Logger.warn('Failed to save review documents and comments');

            if (e instanceof Error) {
                Logger.warn('Error: ' + e.message);

                if (typeof e.stack !== 'undefined') {
                    Logger.warn('Error Stack:\n' + e.stack);
                }
            }

            await transaction.abortTransaction();

            // We want to report an error and then send errors on the review to the requester
            // since they might want to know why the import failed (even tho we don't entirely know!!!)
            return this.fail('Internal Failure');
        } finally {
            transaction.endSession();
        }

        return { status: 'ok' };
    }

    /**
     * Function that will attempt to import all of the specified 'ids' that
     * need to be imported to make the review importable. The function will
     * return an array of @see ImportUserStatus so that the review import
     * manager can handle the
     */
    async importReferences(): Promise<
        ReviewImportVerificationStatus<Map<SgUserId, Extract<UserImportStatus, { status: 'ok' }>>>
    > {
        const users = new Map();

        // We need to keep a copy of the authors set because we might need to keep track of who is valid,
        // and who is invalid to avoid redundant calls...
        const authorCopy = new Map(this.authors);

        for (const id of this.authors.keys()) {
            // Ensure that getting this author still makes sense...
            if (!authorCopy.has(id)) {
                continue;
            }

            const user = await importUser(id);

            // Oops, we failed to import this author, so we have to invalidate any comments
            // that reference this
            if (user.status === 'error') {
                const toInvalidate = new Set<number>();

                this.validComments.forEach((value) => {
                    const comment = this.commentMap.get(value);
                    assert(typeof comment !== 'undefined');

                    if (comment.author === id) {
                        this.addCommentIssue(comment.id, 'author', "Couldn't import author");
                        toInvalidate.add(comment.id);
                        authorCopy.delete(comment.author);
                    }

                    // Invalidate any comments that have invalid references too
                    if (
                        !authorCopy.has(comment.author) ||
                        (typeof comment.replying !== 'undefined' &&
                            toInvalidate.has(comment.replying))
                    ) {
                        this.addCommentIssue(
                            comment.id,
                            'replying',
                            'Comment is replying to malformed comment',
                        );
                        toInvalidate.add(comment.id);
                        authorCopy.delete(comment.author);
                    }
                });

                this.invalidateComments(toInvalidate);
                this.constructCommentThreads(); // Re-construct threads

                // Exit early if all the comments are invalid
                if (this.validComments.size === 0) {
                    return this.fail('All comments are invalid');
                }

                continue;
            }

            users.set(id, user);
        }

        return { status: 'ok', data: users };
    }
}
