import { ExistUsernameSchema } from './user';
import { z } from 'zod';


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
    revision: z.string().nonempty(),
    collaborators: CollaboratorArraySchema,
});

export type IPublicationCreationRequest = z.input<typeof IPublicationCreationSchema>;

export const IPublicationPatchRequestSchema = IPublicationCreationSchema.partial();
export type IUserPatchRequest = z.infer<typeof IPublicationPatchRequestSchema>;
