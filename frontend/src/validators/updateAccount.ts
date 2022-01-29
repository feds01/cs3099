import { z } from 'zod';

export const AccountUpdateSchema = z.object({
    firstName: z.string().max(32).optional(),
    lastName: z.string().max(32).optional(),
    email: z.string().email().optional(),
    username: z.string().max(50).optional(),
    status: z.string().max(32).optional(),
    about: z.string().optional(),
});

export type AccountUpdate = z.infer<typeof AccountUpdateSchema>;
