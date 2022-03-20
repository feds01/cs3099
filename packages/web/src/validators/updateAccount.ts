import { z } from 'zod';

export const AccountUpdateSchema = z
    .object({
        name: z.string().max(256),
        email: z.string().email(),
        username: z.string().max(50),
        status: z.string().max(32),
        about: z.string(),
    })
    .partial();

export type AccountUpdate = z.infer<typeof AccountUpdateSchema>;
