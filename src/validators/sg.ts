import assert from 'assert';
import { z } from 'zod';
import { ICommentAnchor } from './comments';

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
        assert(components?.length === 3);

        return {
            id: components[1] as string,
            group: components[2] as string,
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
    introduction: z.string(),
    owner: SgUserIdSchema,
    revision: z.string().min(1).optional(),
    collaborators: z.array(SgUserIdSchema),
});

export type SgPublication = z.infer<typeof SgPublicationSchema>;

export const ExportSgPublicationSchema = SgPublicationSchema.omit({
    owner: true,
    collaborators: true,
}).merge(z.object({ owner: z.string(), collaborators: z.array(z.string()) }));

export type ExportSgPublication = z.infer<typeof ExportSgPublicationSchema>;

/**
 * Type representing a Supergroup comment on a publication.
 */
export const SgCommentSchema = z.object({
    id: z.number().int().nonnegative(),
    replying: z.number().int().nonnegative().optional(),
    filename: z.string().optional(),
    anchor: ICommentAnchor.optional(),
    contents: z.string().min(1),
    author: SgUserIdSchema,
    postedAt: z.number().int().nonnegative(),
});

export type SgComment = z.infer<typeof SgCommentSchema>;

export const ExportSgCommentSchema = SgCommentSchema.omit({ author: true }).merge(
    z.object({ author: z.string() }),
);

export type ExportSgComment = z.infer<typeof ExportSgCommentSchema>;

/**
 * Type representing a Super-group review on a publication.
 */
export const SgReviewSchema = z.object({
    owner: SgUserIdSchema,
    createdAt: z.number().int().nonnegative(),
    comments: z.array(SgCommentSchema),
});

export type SgReview = z.infer<typeof SgReviewSchema>;

export const ExportSgReviewSchema = SgReviewSchema.omit({ owner: true }).merge(
    z.object({ owner: z.string() }),
);

export type ExportSgReview = z.infer<typeof ExportSgReviewSchema>;

/**
 * Schema representing a request from a meta data export.
 */
export const SgMetadataSchema = z.object({
    publication: SgPublicationSchema,
    reviews: z.array(SgReviewSchema),
});
