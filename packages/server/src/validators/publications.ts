import { z } from 'zod';

import { ExistUsernameSchema, UsernameSchema } from './user';

const PublicationNameSchema = z
    .string()
    .min(1)
    .regex(/^[a-zA-Z0-9._~-]*$/, { message: 'Name must be URL safe.' })
    .transform((x) => x.toLowerCase());

export const PublicationRevisionSchema = z
    .string()
    .min(1)
    .regex(/^[a-zA-Z0-9._~-]*$/, { message: 'Revision must be URL safe.' })
    .transform((x) => x.toLowerCase());

const CollaboratorArraySchema = z
    .array(ExistUsernameSchema)
    .transform((x) => new Set(x.filter((c) => c !== null)));

export const IPublicationCreationSchema = z.object({
    name: PublicationNameSchema,
    title: z.string().min(1).max(200),
    introduction: z.string().optional(),
    about: z.string().max(140).optional(),
    revision: PublicationRevisionSchema,
    collaborators: CollaboratorArraySchema,
});

export type IPublicationCreationRequest = z.input<typeof IPublicationCreationSchema>;

/**
 * This is a schema used to validate publication patch requests. Essentially, it is a copy
 * of the @see IPublicationCreationSchema but it's partial meaning that all the fields are marked
 * as optional. This schema additionally checks that when you attempt to switch the revision
 * you don't use attempt to use a revision tag that's already in use.
 */
export const IPublicationPatchRequestSchema = IPublicationCreationSchema.omit({ name: true })
    .extend({ pinned: z.boolean() })
    .partial();

export type IUserPatchRequest = z.infer<typeof IPublicationPatchRequestSchema>;

/** Schema for validating requests that fetch publications by name and username */
export const PublicationByNameRequestSchema = z.object({
    username: UsernameSchema,
    name: PublicationNameSchema,
});

/** Schema for creating revisions of a publication */
export const IRevisionSchema = z.object({
    revision: PublicationRevisionSchema,
    changelog: z.string(),
});
