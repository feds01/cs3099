import mongoose from 'mongoose';
import { z } from 'zod';

export const ObjectIdSchema = z
    .string()
    .refine(mongoose.Types.ObjectId.isValid, { message: 'Not a valid object id' })
    .transform((id) => new mongoose.Types.ObjectId(id));

// Schema for describing if the request is querying by user ID or by username.
const modes = ['username', 'id'] as const;
export const ModeSchema = z.enum(modes).default('username');

// Schema for describing whether a given flag is toggled or not
export const FlagSchema = z.enum(['false', 'true']).transform((f) => f === 'true');

export type UserRequestMode = z.infer<typeof ModeSchema>;

const sorts = ['directory', 'file'] as const;
export const ResourceSortSchema = z.enum(sorts).optional();

/** Schema for representing a pagination query */
export const PaginationQuerySchema = z.object({
    /** The number of items that should be taken from the given offset */
    take: z.number().int().min(1).max(200).default(50),
    /** The offset number of items to read from */
    skip: z.number().int().default(0),
});
