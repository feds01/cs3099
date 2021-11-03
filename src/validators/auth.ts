import { z } from 'zod';

export const IEmailValiditySchema = z.object({
    email: z.string().email(),
});

export type IEmailValidity = z.infer<typeof IEmailValiditySchema>;

export const IUsernameValiditySchema = z.object({
    username: z.string().regex(/^[a-zA-Z0-9_]*$/, 'Username must be alphanumeric'),
});

export type IUsernameValidity = z.infer<typeof IUsernameValiditySchema>;
