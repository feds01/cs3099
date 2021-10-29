import { z } from 'zod';
import {UsernameSchema} from "./user"

const CollaboratorArraySchema = UsernameSchema
        .array()
        .refine(
                (arr) => arr.length === new Set(arr).size,
                { message: "No duplicated collaborators allowed" }
        );

export const ISubmissionPostRequestSchema = z.object({
        revision: z.string().nonempty(),
        owner: UsernameSchema,
        title: z.string().nonempty(),
        introduction: z.string().nonempty(),
        collaborators: CollaboratorArraySchema,
});

export type ISubmissionPostRequest = z.infer<typeof ISubmissionPostRequestSchema>;
