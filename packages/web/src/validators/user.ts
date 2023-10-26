import { z } from 'zod';
import { postAuthEmailvalidity, postAuthUsernamevalidity } from '../lib/api/auth/auth';

const USERNAME_REGEX = /^[a-zA-Z0-9._~-]*$/;

/** Generic user object schema */
export const UserSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    username: z.string().min(1).regex(USERNAME_REGEX, { message: 'Username must be URL safe.' }),
    role: z.enum(['default', 'moderator', 'administrator']),
    name: z.string().optional(),
    createdAt: z.number(),
    profilePictureUrl: z.string().optional(),
    status: z.string().optional(),
    about: z.string().optional(),
});

/** User registration schema */
export const RegisterSchema = z
    .object({
        name: z.string().max(256),
        email: z.string().email(),
        username: z.string().nonempty().max(50).regex(USERNAME_REGEX, { message: 'Username must be URL safe.' }),
        password: z.string().min(1),
        confirm: z.string().min(1),
    })
    .superRefine((val, ctx) => {
        // check that the password and confirmed password match
        if (val.password !== val.confirm) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['confirm'],
                message: "Passwords don't match.",
            });
        }
    })
    .superRefine(async (val, ctx) => {
        if (val.username !== '') {
            const usernameUniqueQuery = await postAuthUsernamevalidity({ username: val.username });

            if (usernameUniqueQuery.status === 'ok' && usernameUniqueQuery.reserved) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['username'],
                    message: 'Username taken',
                });
            }
        }
    })
    .superRefine(async (val, ctx) => {
        if (val.email !== '') {
            const emailUniqueQuery = await postAuthEmailvalidity({ email: val.email });

            if (emailUniqueQuery.status === 'ok' && emailUniqueQuery.reserved) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['email'],
                    message: 'Email in use',
                });
            }
        }
    });

export type IRegisterForm = z.infer<typeof RegisterSchema>;

/** User login schema */
export const LoginSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
    rememberLogin: z.boolean(),
});

export type ILoginForm = z.infer<typeof LoginSchema>;

/** User update schema, allowing to update name, email, username, status, and about fields */
export const UserUpdateSchema = UserSchema.pick({
    name: true,
    email: true,
    username: true,
    status: true,
    about: true,
}).partial();

export type AccountUpdate = z.infer<typeof UserUpdateSchema>;
