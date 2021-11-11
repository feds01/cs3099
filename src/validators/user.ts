import { z } from 'zod';

import * as error from '../common/errors';
import User, { IUserRole } from '../models/User';

export const IUserLoginRequestSchema = z
    .object({
        username: z.string().optional(),
        password: z.string().nonempty(),
    })
    .transform((val) => {
        const email = z.string().email().safeParse(val.username);

        // Use the email instead of the provided username
        if (email.success) {
            return { ...val, isEmail: true };
        }

        return { ...val, isEmail: false };
    });

export type IUserLoginRequest = z.infer<typeof IUserLoginRequestSchema>;

export const IUserRegisterRequestSchema = z.object({
    username: z
        .string()
        .nonempty()
        .max(50)
        .regex(/^[a-zA-Z0-9_]*$/, 'Username must be alphanumeric'),
    email: z.string().email(),
    firstName: z.string().nonempty().max(32),
    lastName: z.string().nonempty().max(32),
    password: z.string().min(1),
    about: z.string().optional(),
    status: z.string().optional(),
    profilePictureUrl: z.string().url().optional(),
});

export const ExistUsernameSchema = z
    .string()
    .nonempty()
    .max(50)
    .regex(/^[a-zA-Z0-9_]*$/, 'Username must be alphanumeric')
    .refine(async (username) => (await User.count({ username })) > 0, {
        message: error.NON_EXISTENT_USER,
    });

export type IUserRegisterRequest = z.infer<typeof IUserRegisterRequestSchema>;

export const IUserPatchRequestSchema = IUserRegisterRequestSchema.omit({
    password: true,
}).partial();

export type IUserPatchRequest = z.infer<typeof IUserPatchRequestSchema>;

export const IUserRoleRequestSchema = z.object({
    role: z.nativeEnum(IUserRole),
});

export type IUserRoleRequest = z.infer<typeof IUserRoleRequestSchema>;
