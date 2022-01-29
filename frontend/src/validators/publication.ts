import { z } from 'zod';

export const CreatePublicationSchema = z.object({
    name: z
        .string()
        .min(1)
        .regex(/^[a-zA-Z0-9_-]*$/, { message: 'Name must be URL safe.' }),
    title: z.string().min(1).max(200),
    introduction: z.string().optional(),
    revision: z.string().optional(),
    collaborators: z.array(z.string()),
});

export type CreatePublication = z.infer<typeof CreatePublicationSchema>;
