import { z } from 'zod';

import { ExistUsernameSchema } from './user';

const CollaboratorArraySchema = ExistUsernameSchema.array().refine(
    (arr) => arr.length === new Set(arr).size,
    { message: 'No duplicated collaborators allowed' },
);

export const IPublicationCreationSchema = z.object({
    name: z
        .string()
        .min(1)
        .regex(/^[a-zA-Z0-9_-]*$/, { message: 'Name must be URL safe.' })
        .transform((x) => x.toLowerCase()),
    title: z.string().min(1).max(200),
    introduction: z.string().optional(),
    about: z.string().max(140).optional(),
    revision: z.string().nonempty(),
    collaborators: CollaboratorArraySchema,
});

export type IPublicationCreationRequest = z.input<typeof IPublicationCreationSchema>;

/**
 * This is a schema used to validate publication patch requests. Essentially, it is a copy
 * of the @see IPublicationCreationSchema but it's partial meaning that all the fields are marked
 * as optional. This schema additionally checks that when you attempt to switch the revision
 * you don't use attempt to use a revision tag that's already in use.
 */
export const IPublicationPatchRequestSchema = IPublicationCreationSchema.partial();

export type IUserPatchRequest = z.infer<typeof IPublicationPatchRequestSchema>;
