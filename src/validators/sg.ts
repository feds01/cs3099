import assert from 'assert';
import { z } from 'zod';

const SG_ID_REGEX = /(.+?(?=:)):(t\d{2})$/;

/**
 * Type representing the format of external Supergroup user ids.
 */
export const SgUserIdSchema = z
    .string()
    .regex(SG_ID_REGEX, {
        message: 'Invalid Supergroup user id',
    })
    .transform((x) => {
        const components = SG_ID_REGEX.exec(x);
        assert(components?.length === 2);

        return {
            id: components[0] as string,
            group: components[1] as string,
        };
    });

export type SgUserId = z.infer<typeof SgUserIdSchema>;

/**
 * Type representing the response shape when user information is queried.
 */
export const SgUserSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    id: SgUserIdSchema,
    profilePictureUrl: z.string().url().optional(),
});

export type SgUser = z.infer<typeof SgUserSchema>;

/**
 * Type representing a Supergroup publication data structure.
 */
export const SgPublicationSchema = z.object({
    name: z.string().min(1),
    title: z.string().min(1),
    owner: SgUserIdSchema,
    revision: z.string().min(1).optional(),
    collaborators: z.array(SgUserIdSchema),
});

export type SgPublication = z.infer<typeof SgPublicationSchema>;

/**
 * Type representing a Supergroup comment on a publication.
 */
export const SgCommentSchema = z.object({
    id: z.number().int().nonnegative(),
    replying: z.number().int().nonnegative(),
    filename: z.string().optional(),
    anchor: z
        .object({
            start: z.number().int().nonnegative(),
            end: z.number().int().nonnegative(),
        })
        .superRefine((anchor, ctx) => {
            if (anchor.start > anchor.end) {
                ctx.addIssue({
                    code: z.ZodIssueCode.too_small,
                    type: 'number',
                    path: ['start'],
                    minimum: anchor.end,
                    inclusive: true,
                    message: 'Comment anchor start should be equal or less than anchor end.',
                });
            }
        }),
    contents: z.string().min(1),
    author: SgUserIdSchema,
    postedAt: z.number().int().nonnegative(),
});

export type SgComment = z.infer<typeof SgCommentSchema>;

/**
 * Type representing a Super-group review on a publication.
 */
export const SgReviewSchema = z.object({
    owner: SgUserIdSchema,
    createdAt: z.number().int().nonnegative(),
    comments: z.array(SgCommentSchema),
});

export type SgReview = z.infer<typeof SgReviewSchema>;
