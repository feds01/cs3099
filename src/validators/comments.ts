import { ObjectIdSchema } from './requests';
import { z } from 'zod';


export const ICommentAnchor = z
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
    });

export const ICommentCreationSchema = z
    .object({
        replying: ObjectIdSchema.optional(),
        filename: z.string().optional(),
        anchor: ICommentAnchor.optional(),
        contents: z.string(),
    })
    .superRefine((comment, ctx) => {
        // Cannot provide line numbers but omit a filename...
        if (typeof comment.anchor !== 'undefined' && typeof comment.filename === 'undefined') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['filename', 'anchor'],
                message: 'Comment anchor should have a relevant filename.',
            });
        }

        // Comment cannot be both replying and be anchored on sources...
        if (typeof comment.filename !== 'undefined' && typeof comment.replying !== 'undefined') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['filename', 'replying'],
                message: 'Comment cannot have an anchor and both be replying to a comment.',
            });
        }
    });

export type ICommentCreation = z.infer<typeof ICommentCreationSchema>;
