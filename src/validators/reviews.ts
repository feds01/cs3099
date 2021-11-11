import { z } from 'zod';

export const IReviewCreationSchema = z.object({});

export type IReviewCreation = z.infer<typeof IReviewCreationSchema>;
