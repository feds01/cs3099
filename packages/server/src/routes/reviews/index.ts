import assert from 'assert';
import express from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';

import * as errors from '../../common/errors';
import * as file from '../../lib/resources/file';
import * as zip from '../../lib/resources/zip';
import Logger from '../../common/logger';
import {
    defaultPermissionVerifier,
    verifyReviewPermission,
} from '../../lib/communication/permissions';
import registerRoute from '../../lib/communication/requests';
import {
    createNotification,
    findUserMentions,
    markNotificationsAsLive,
} from '../../lib/notification';
import { IActivityOperationKind, IActivityType } from '../../models/Activity';
import Comment, { PopulatedComment } from '../../models/Comment';
import Publication from '../../models/Publication';
import Review, { IReviewStatus, PopulatedReview } from '../../models/Review';
import User, { AugmentedUserDocument, IUser, IUserRole } from '../../models/User';
import { ResponseErrorSummary } from '../../transformers/error';
import { ReviewAggregation } from '../../types/aggregation';
import { ICommentCreationSchema } from '../../validators/comments';
import { PaginationQuerySchema } from '../../validators/pagination';
import { FlagSchema, ObjectIdSchema } from '../../validators/requests';

const router = express.Router();

/**
 * @version v1.0.0
 * @method GET
 * @url /api/review
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/review
 *
 * @description This endpoint is used to get all the relevant reviews to a
 * requester. This is done by checking if any of the publications that the
 * requester is an owner of or a collaborator (optionally) has received any
 * recent reviews.
 */
registerRoute(router, '/', {
    method: 'get',
    query: z
        .object({ asCollaborator: FlagSchema.optional(), filterSelf: FlagSchema.optional() })
        .merge(PaginationQuerySchema),
    params: z.object({}),
    headers: z.object({}),
    permissionVerification: defaultPermissionVerifier,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const requesterId = req.requester._id;
        const { skip, take, asCollaborator, filterSelf } = req.query;

        // We want to find any recent reviews on publications that the requester
        // owns
        const publications = await Publication.find({
            $or: [
                { owner: requesterId },
                ...(typeof asCollaborator !== 'undefined' && asCollaborator
                    ? [
                          {
                              collaborators: {
                                  $elemMatch: { $eq: requesterId },
                              },
                          },
                      ]
                    : []),
            ],
        }).exec();

        // Perform an aggregation that will find all of the reviews that are in publications that
        // the requester is the owner or marked as a collaborator (if specified in the request).
        // Additionally, if the 'filterSelf' flag is specified, we have to filter out all reviews
        // where the owner is the requester.
        const aggregation = (await Review.aggregate([
            {
                $facet: {
                    data: [
                        {
                            $match: {
                                status: IReviewStatus.Completed,
                                publication: {
                                    $in: publications.map((publication) => publication._id),
                                },
                                ...(typeof filterSelf !== 'undefined' &&
                                    filterSelf && { owner: { $ne: requesterId } }),
                            },
                        },
                        { $sort: { _id: -1 } },
                        { $skip: skip },
                        { $limit: take },
                    ],
                    total: [{ $count: 'total' }],
                },
            },
            {
                $project: {
                    data: 1,
                    // Get total from the first element of the metadata array
                    total: { $arrayElemAt: ['$total.total', 0] },
                },
            },
        ])) as unknown as [ReviewAggregation];

        const result = aggregation[0];

        // Now we need to populate the reviews...
        const hydratedResults = (await Publication.populate(result.data, [
            { path: 'owner' },
            { path: 'publication' },
        ])) as unknown as PopulatedReview[];

        return {
            status: 'ok',
            code: 200,
            data: {
                reviews: await Promise.all(
                    hydratedResults.map(async (review) => await Review.project(review)),
                ),
                total: result.total ?? 0,
                skip,
                take,
            },
        };
    },
});

/**
 * @version v1.0.0
 * @method PUT
 * @url /api/review/:id/comment
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/review/89183192381293/comment
 *
 * @description This endpoint is used to add a comment to a given review specified
 * by it's id. The endpoint accepts a comment object that contains information about
 * it's relation to the publication sources, the content of the comment and whether
 * it is a replying comment rather than a standalone comment.
 *
 */
registerRoute(router, '/:id/comment', {
    method: 'put',
    body: ICommentCreationSchema,
    query: z.object({}),
    params: z.object({ id: ObjectIdSchema }),
    headers: z.object({}),
    permissionVerification: verifyReviewPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const { replying, filename, anchor, contents } = req.body;
        const review = req.permissionData;

        // Check if the thread is replying to another comment
        let thread = new mongoose.Types.ObjectId();

        if (typeof replying !== 'undefined') {
            const replyingComment = await Comment.findById(replying).exec();

            if (!replyingComment) {
                return {
                    status: 'error',
                    code: 400,
                    message: 'Attempt to reply on a non-existent comment',
                };
            }

            // Verify that the comment has a thread since it'll be created if it doesn't...
            if (typeof replyingComment.thread === 'undefined') {
                Logger.error('Comment selected for replying should have a thread id...');

                return {
                    status: 'error',
                    code: 500,
                    message: errors.INTERNAL_SERVER_ERROR,
                };
            }

            thread = new mongoose.Types.ObjectId(replyingComment.thread.toString());
        }

        // If either the filename or the anchor is present on the comment, we need
        // to check that they are valid for the current submission....
        if (typeof filename !== 'undefined') {
            let archiveIndex = {
                userId: review.publication.owner._id.toString(),
                name: review.publication.name,
                ...(!review.publication.current && { revision: review.publication.revision }),
            };

            const archive = zip.loadArchive(archiveIndex);

            if (archive === null) {
                return {
                    status: 'error',
                    code: 500,
                    message: errors.INTERNAL_SERVER_ERROR,
                };
            }

            // check that the given filename exists within the publication...
            const entry = archive.getEntry(filename);

            if (!entry) {
                return {
                    status: 'error',
                    code: 400,
                    message: errors.BAD_REQUEST,
                    errors: {
                        filename: {
                            message: "Filename path doesn't exist in the current archive.",
                        },
                    } as ResponseErrorSummary,
                };
            }

            // If the anchor is specified, check that the line range makes sense, we don't have to
            // validate that both of the line numbers are semantically correct, but we do need to
            // check that both values exist in the file.
            if (typeof anchor !== 'undefined') {
                const lines = file.countLines(entry.getData().toString());

                // end + 1 is allowed since it might cover the last line and thus the anchor becomes ranged
                // to the last line and the the last line + 1
                if (anchor.start > lines || anchor.end > lines + 1) {
                    return {
                        status: 'error',
                        message: errors.BAD_REQUEST,
                        code: 400,
                        errors: {
                            anchor: { message: 'Anchor range is invalid.' },
                        } as ResponseErrorSummary,
                    };
                }
            }
        }

        const newComment = await new Comment({
            filename,
            anchor,
            contents,
            replying,
            review: req.params.id,
            thread,
            owner: req.requester.id,
            publication: review.publication._id.toString(),
        }).save();

        const populated = (await newComment.populate<{ owner: AugmentedUserDocument }>(
            'owner',
        )) as unknown as PopulatedComment;

        // Here, we have to create a new notification for every found 'tagging reference within the comment...
        await Promise.all(
            [...findUserMentions(contents)].map(async (mention) => {
                await createNotification(
                    mention,
                    req.params.id,
                    req.requester,
                    populated._id,
                    req.permissionData.status === IReviewStatus.Completed,
                );
            }),
        );

        return {
            status: 'ok',
            code: 201,
            data: {
                comment: Comment.project(populated),
            },
        };
    },
});

/**
 * @version v1.0.0
 * @method GET
 * @url /api/review/:id/comments
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/review/89183192381293/comments
 *
 * @description This endpoint is used to list the comments on a particular review specified
 * by the id of the review.
 *
 * @@Future: Should be able to specify some filtration parameters with regards to which comments
 * should be listed from this endpoint. More specifically, we want to filter by owner, thread,
 * file, etc.
 */
registerRoute(router, '/:id/comments', {
    method: 'get',
    query: z.object({}),
    params: z.object({ id: ObjectIdSchema }),
    headers: z.object({}),
    permissionVerification: verifyReviewPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const review = req.permissionData;

        // Find all the comments on the current review...
        const result = await Comment.find({ review: review._id.toString() })
            .populate<{ owner: IUser }>('owner')
            .exec();

        const comments = result.map(Comment.project);

        return {
            status: 'ok',
            code: 200,
            data: {
                comments,
            },
        };
    },
});

/**
 * @version v1.0.0
 * @method POST
 * @url /api/review/:id/complete
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/review/89183192381293/complete
 *
 * @description This endpoint is used to signal that the owner of the review has finalised
 * their review and wishes to publish it on the platform.
 *
 */
registerRoute(router, '/:id/complete', {
    method: 'post',
    body: z.object({}),
    query: z.object({}),
    params: z.object({ id: ObjectIdSchema }),
    headers: z.object({}),
    activity: {
        kind: IActivityOperationKind.Create,
        type: IActivityType.Review,
        permission: IUserRole.Default,
    },
    activityMetadataFn: async (_requester, req, _response) => {
        assert(req.permissionData !== null);

        // we need to find the publication owner
        const publicationOwner = await User.findOne(req.permissionData.publication.owner).exec();
        assert(publicationOwner !== null);

        // We want to count the number of comments that the publication has done
        const comments = await Comment.count({ review: req.params.id });

        return {
            document: req.params.id,
            metadata: {
                publicationId: req.permissionData.publication._id.toString(),
                publicationName: req.permissionData.publication.name,
                publicationOwner: publicationOwner.username,
                comments,
            },
            liveness: true,
        };
    },
    permissionVerification: verifyReviewPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        // We don't want to accept reviews that are already 'completed' because this then creates
        // another activity for a review that has already been completed.
        if (req.permissionData.status !== IReviewStatus.Started) {
            return {
                status: 'ok',
                code: 200,
            };
        }

        await Review.findByIdAndUpdate(req.params.id, {
            $set: { status: IReviewStatus.Completed },
        }).exec();

        // We also want to mark any notifications as live
        await markNotificationsAsLive(req.params.id);

        return {
            status: 'ok',
            code: 200,
        };
    },
});

/**
 * @version v1.0.0
 * @method POST
 * @url /api/review/:id
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/review/89183192381293
 *
 * @description This endpoint is used to get a review specified by the id.
 *
 */
registerRoute(router, '/:id', {
    method: 'get',
    query: z.object({}),
    params: z.object({ id: ObjectIdSchema }),
    headers: z.object({}),
    permissionVerification: verifyReviewPermission,
    permission: { level: IUserRole.Default },
    handler: async (req) => {
        const review = req.permissionData;

        return {
            status: 'ok',
            code: 200,
            data: {
                review: await Review.project(review),
            },
        };
    },
});

/**
 * @version v1.0.0
 * @method DELETE
 * @url /api/review/:id
 * @example
 * https://cs3099user06.host.cs.st-andrews.ac.uk/api/review/89183192381293
 *
 * @description This endpoint is used to delete a review specified by it's id.
 *
 */
registerRoute(router, '/:id', {
    method: 'delete',
    query: z.object({}),
    params: z.object({ id: ObjectIdSchema }),
    headers: z.object({}),
    permissionVerification: verifyReviewPermission,
    permission: { level: IUserRole.Administrator },
    handler: async (req) => {
        const { id } = req.params;

        // Delete the entire review and delete all the comments on the review...
        const review = await Review.findByIdAndDelete(id).exec();

        if (!review) {
            return {
                status: 'error',
                code: 404,
                message: errors.RESOURCE_NOT_FOUND,
            };
        }

        return {
            status: 'ok',
            code: 200,
        };
    },
});

export default router;
