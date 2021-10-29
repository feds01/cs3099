import { z } from 'zod';

import mongoose from 'mongoose';
import * as error from '../common/errors';
import User, { IUserRole } from '../models/User';

/**
 * This is the password regex. It specifies that the password must be between the length
 * of 8 to 30 characters, whilst including at least one special character, one uppercase
 * character, and a digit.
 */
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*?])[A-Za-z\d#$@!%&*?]{8,30}$/;

export const IUserLoginRequestSchema = z
    .object({
        username: z.string().optional(),
        password: z.string().nonempty(),
    })
    .transform((val) => {
        let email = z.string().email().safeParse(val.username);

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
    password: z.string().regex(PASSWORD_REGEX),
    about: z.string().optional(),
    status: z.string().optional(),
    profilePictureUrl: z.string().url().optional(),
});

export const ObjectIdSchema = z.string().refine(mongoose.Types.ObjectId.isValid, { message: "Not a valid object id" });
export const UsernameSchema = z
        .string()
        .nonempty()
        .max(50)
        .regex(/^[a-zA-Z0-9_]*$/, 'Username must be alphanumeric')
        .refine(
                async (username) => await User.count({ username }) > 0,
                { message: error.NON_EXISTENT_USER }
        );

export type IUserRegisterRequest = z.infer<typeof IUserRegisterRequestSchema>;

export const IUserPatchRequestSchema = IUserRegisterRequestSchema.omit({
    password: true,
}).partial();

export type IUserPatchRequest = z.infer<typeof IUserPatchRequestSchema>;

export const IUserRoleRequestSchema = z.object({
    role: z.nativeEnum(IUserRole),
});

export type IUserRoleRequest = z.infer<typeof IUserRoleRequestSchema>;
