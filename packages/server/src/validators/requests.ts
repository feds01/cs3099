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

export type ResourceSortOrder = z.infer<typeof ResourceSortSchema>;
