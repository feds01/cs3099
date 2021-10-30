import { z } from 'zod';
import { ExistUsernameSchema } from "./user"

const CollaboratorArraySchema = ExistUsernameSchema
        .array()
        .refine(
                (arr) => arr.length === new Set(arr).size,
                { message: "No duplicated collaborators allowed" }
        );

export const ISubmissionPostRequestSchema = z.object({
        revision: z.string().nonempty(),
        title: z.string().nonempty(),
        introduction: z.string().nonempty(),
        collaborators: CollaboratorArraySchema,
        attachment: z.string().optional(),
});

export const SearchModeSchema = z.enum(['title', 'username']).default('title');

export type SearchRequestMode = z.infer<typeof SearchModeSchema>
export type ISubmissionPostRequest = z.infer<typeof ISubmissionPostRequestSchema>;