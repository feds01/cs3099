import { z } from 'zod';

export const LoginSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
    rememberLogin: z.boolean(),
});

export type ILoginForm = z.infer<typeof LoginSchema>;
