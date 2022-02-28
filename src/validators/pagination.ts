import { z } from 'zod';

const PaginationSchema = z.object({
    /** The offset number of items to read from */
    skip: z.number().int().min(0).default(0),
    /** The number of items that should be taken from the given offset */
    take: z.number().int().min(1).max(200).default(50),
});

export type Pagination = z.infer<typeof PaginationSchema>;

/** Schema for representing a pagination query */
export const PaginationQuerySchema = z.object({
    take: z.preprocess(
        (i) => (typeof i !== 'undefined' ? Number.parseInt(String(i), 10) : i),
        PaginationSchema.shape.take,
    ),
    skip: z.preprocess(
        (i) => (typeof i !== 'undefined' ? Number.parseInt(String(i), 10) : i),
        PaginationSchema.shape.skip,
    ),
});
