import { z } from 'zod';

export const RegisterSchema = z
    .object({
        firstName: z.string().nonempty().max(32),
        lastName: z.string().nonempty().max(32),
        email: z.string().email(),
        username: z.string().nonempty().max(50),
        password: z.string().min(1),
        confirm: z.string().min(1),
    })
    .superRefine((val, ctx) => {
        // TODO: check that the username and email are unique

        // check that the password and confirmed password match
        if (val.password !== val.confirm) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['confirm'],
                message: "Passwords don't match.",
            });
        }
    });

export type IRegisterForm = z.infer<typeof RegisterSchema>;
