import { z } from 'zod';
import mongoose from 'mongoose';

export const ObjectIdSchema = z
    .string()
    .refine(mongoose.Types.ObjectId.isValid, { message: 'Not a valid object id' });

// Schema for describing if the request is querying by user ID or by username.
const modes = ['username', 'id'] as const;
export const ModeSchema = z.enum(modes).default('username');

export type UserRequestMode = z.infer<typeof ModeSchema>;
