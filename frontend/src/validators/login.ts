import { z } from 'zod';

export const LoginSchema = z.object({
    username: z.string(),
    password: z.string().nonempty(),
    rememberLogin: z.boolean(),
});

export type ILoginForm = z.infer<typeof LoginSchema>;
