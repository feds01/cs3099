import { z } from 'zod';

export const TokenSchema = z.object({
    sub: z.string(),
    exp: z.number(),
    data: z.any(),
});

export type VerifiedToken = z.infer<typeof TokenSchema>;
