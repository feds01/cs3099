import { z } from 'zod';

import { IReviewStatus } from '../models/Review';
import { ObjectIdSchema } from './requests';

/** This schema represents the saved metadata when a review creation activity is created */
export const ReviewCreateMetadata = z.object({
    publicationId: ObjectIdSchema,
    publicationName: z.string(),
    publicationOwner: z.string(),
    comments: z.number(),
});

/** This schema represents the saved metadata when a comment creation activity is created */
export const CommentCreateMetadata = z.object({
    reviewId: ObjectIdSchema,
    reviewStatus: z.nativeEnum(IReviewStatus),
});

/** This schema represents the saved metadata when a publication is created  */
export const PublicationCreateMetadata = z.object({
    collaborators: z.number().nonnegative(),
    name: z.string(),
});

/** This schema represents the saved metadata when a publication is created  */
export const PublicationReviseMetadata = z.object({
    owner: z.string(),
    name: z.string(),
    oldRevision: z.string(),
    newRevision: z.string(),
});
