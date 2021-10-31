import { z } from 'zod';
import { ExistUsernameSchema } from './user';

const CollaboratorArraySchema = ExistUsernameSchema.array().refine(
    (arr) => arr.length === new Set(arr).size,
    { message: 'No duplicated collaborators allowed' },
);

export const IPublicationPostRequestSchema = z.object({
    revision: z.string().nonempty(),
    title: z.string().nonempty(),
    name: z.string().nonempty(),
    introduction: z.string().nonempty(),
    collaborators: CollaboratorArraySchema,
    draft: z.boolean().default(false),
});

// TODO: Implement better schema
export const SearchQuerySchema = z.object({
    owner: z.string().optional(),
    title: z.string().optional(),
    introduction: z.string().optional(),
    keyword: z.string().optional(),
    collaborators: z.string().array(),
});

export type IPublicationPostRequest = z.input<typeof IPublicationPostRequestSchema>;
