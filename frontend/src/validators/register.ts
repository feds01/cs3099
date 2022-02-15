import { z } from 'zod';

export const RegisterSchema = z
    .object({
        name: z.string().max(256),
        email: z.string().email(),
        username: z
            .string()
            .nonempty()
            .max(50)
            .regex(/^[a-zA-Z0-9_]*$/, 'Username must be alphanumeric'),
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
