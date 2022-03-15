import { z } from 'zod';

import { IReviewStatus } from '../models/Review';
import { ObjectIdSchema } from './requests';

/** This schema represents the saved metadata when a review creation activity is created */
export const ReviewCreateMetadata = z.object({
    reviewId: ObjectIdSchema,
    publicationId: ObjectIdSchema,
    comments: z.number(),
});

/** This schema represents the saved metadata when a comment creation activity is created */
export const CommentCreateMetadata = z.object({
    reviewId: ObjectIdSchema,
    reviewStatus: z.nativeEnum(IReviewStatus),
});
