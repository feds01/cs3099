import { z } from 'zod';

export const AccountUpdateSchema = z
    .object({
        firstName: z.string().max(32),
        lastName: z.string().max(32),
        email: z.string().email(),
        username: z.string().max(50),
        status: z.string().max(32),
        about: z.string(),
    })
    .partial();

export type AccountUpdate = z.infer<typeof AccountUpdateSchema>;
