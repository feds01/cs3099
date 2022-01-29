import { z } from 'zod';

// Use a schema for validating the session schema.
export const SessionSchema = z.object({
    id: z.string(),
    email: z.string(),
    username: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    status: z.string().optional(),
    about: z.string().optional(),
    profilePictureUrl: z.string().optional(),
    createdAt: z.number().nonnegative(),
});
