import { RefinementEffect, z } from 'zod';

import * as error from '../common/errors';
import User, { AugmentedUserDocument, IUserRole } from '../models/User';

/** Regex that is used for validating usernames */
export const USERNAME_REGEX = /^[a-zA-Z0-9._~-]+$/;

/**
 * Schema for validating login requests.
 */
export const IUserLoginRequestSchema = z
    .object({
        username: z.string().nonempty(),
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

/**
 * Generic User schema that can be used for registering, patching and other more
 * advanced schemas.
 */
export const IUserSchema = z.object({
    username: z.string().nonempty().max(50).regex(USERNAME_REGEX, 'Username must be URL safe'),
    email: z.string().email(),
    name: z.string().max(256),
    password: z.string().min(1),
    about: z.string().optional(),
    status: z.string().optional(),
    profilePictureUrl: z.string().url().optional(),
});

/**
 * This Schema is used to validate patch requests for users, omitting fields
 * that cannot be patched like the 'password', 'profilePictureUrl'
 */
export const IUserPatchRequestSchema = IUserSchema.omit({
    password: true,
    profilePictureUrl: true,
}).partial();

type PartialUserSchema = z.infer<typeof IUserPatchRequestSchema>;

/**
 * Function to verify that a username or email cannot be modified to ones that already
 * exist in the system.
 *
 * @param val - Any schema that matches a partial User schema
 * @param ctx
 */
const verifyUniqueDetails: RefinementEffect<PartialUserSchema>['refinement'] = async (val, ctx) => {
    const { username, email } = val;

    // Check if username or email is already in use
    const searchQueryUser = {
        $or: [
            ...(typeof username !== 'undefined' ? [{ username }] : []),
            ...(typeof email !== 'undefined' ? [{ email, externalId: { $exists: false } }] : []),
        ],
    };

    const user = await User.findOne(searchQueryUser).exec();

    if (user?.username === username) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['username'],
            message: 'Username already taken',
        });
    } else if (user?.email === email) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['email'],
            message: 'Email already taken',
        });
    }
};

/**
 * This schema is an expansion of the generic 'User' schema because it adds additional validation
 * about if the email or the name exists. This can't be on the generic schema because we don't always
 * want this check to occur.
 *
 */
export const IUserRegisterRequestSchema = IUserSchema.superRefine(verifyUniqueDetails);

/**
 * This Schema is used to validate requests that attempt to patch
 * the role of a user. Roles are constrained to an enum @see IUserRole.
 */
export const IUserRoleRequestSchema = z.object({
    role: z.nativeEnum(IUserRole),
});

/**
 * This Schema is used to verify that a given username must exist in the
 * current database, otherwise the schema will fail.
 */
export const ExistUsernameSchema = z
    .string()
    .nonempty()
    .max(50)
    .regex(USERNAME_REGEX, 'Username must be URL safe')
    .transform(async (username) => {
        const user: AugmentedUserDocument | null = await User.findOne({ username });

        if (user !== null) {
            return user._id.toString();
        }

        return null;
    })
    .refine((id) => id !== null, {
        message: error.NON_EXISTENT_USER,
    });
