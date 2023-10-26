import { z } from 'zod';

const ActivityReferenceSchema = z.object({
    type: z.enum(['comment', 'user', 'review', 'publication']),
    // @@Safety: We could improve this typing later to properly type dependent on
    //           value that is specified in the type field.
    document: z.any(),
});

/**
 * This schema represents the result of a projection of an activity, The purpose of this
 * schema is to verify that the generated schema message is valid in terms that it has
 * the same number of references as the number of references provided. If there is
 * a mismatch in the number of references, the request will fail internally as something
 * is inconsistent.
 */
export const TransformedActivitySchema = z
    .object({
        message: z.string(),
        references: z.array(ActivityReferenceSchema),
    })
    // References are defined in the form of '<\d+>', so for the number of regex matches
    // that are present in the message, we should be able to have the same number of references.
    .refine((value) => [...value.message.matchAll(/<\d+>/g)].length === value.references.length);
