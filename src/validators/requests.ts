import { z } from 'zod';
import mongoose from 'mongoose';

export const ObjectIdSchema = z
    .string()
    .refine(mongoose.Types.ObjectId.isValid, { message: 'Not a valid object id' });
