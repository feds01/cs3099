import { z } from 'zod';

export const IJwtSchema = z
    .string()
    .regex(/^Bearer ([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_\-+/=]*)/, 'Invalid JWT.')
    .transform((x) => {
        const [_, token] = x.split(' ');

        if (typeof token === 'undefined') {
            throw Error('Invalid schema for JWT');
        }

        return token;
    });

export const IEmailValiditySchema = z.object({
    email: z.string().email(),
});

export type IEmailValidity = z.infer<typeof IEmailValiditySchema>;

export const IUsernameValiditySchema = z.object({
    username: z.string().regex(/^[a-zA-Z0-9_]*$/, 'Username must be alphanumeric'),
});

export type IUsernameValidity = z.infer<typeof IUsernameValiditySchema>;
