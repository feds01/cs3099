import { z } from 'zod';

import { IUserRole } from '../models/User';

/**
 * This is the password regex. It specifies that the password must be between the length
 * of 8 to 30 characters, whilst including at least one special character, one uppercase
 * character, and a digit.
 */
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*?])[A-Za-z\d#$@!%&*?]{8,30}$/;

export const IUserLoginRequestSchema = z
    .object({
        username: z.string().nonempty().max(50).optional(),
        email: z.string().email().optional(),
        password: z.string().nonempty(),
    })
    .refine((data) => data.username || data.email, 'Either username or email should be specified.');

export type IUserLoginRequest = z.infer<typeof IUserLoginRequestSchema>;

export const IUserRegisterRequestSchema = z.object({
    username: z.string().nonempty().max(50),
    email: z.string().email(),
    firstName: z.string().nonempty().max(32),
    lastName: z.string().nonempty().max(32),
    password: z.string().regex(PASSWORD_REGEX),
    about: z.string(),
    profilePictureUrl: z.string().url(),
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