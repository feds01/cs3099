import { z } from 'zod';

export const CreatePublicationSchema = z.object({
    name: z
        .string()
        .min(1)
        .regex(/^[a-zA-Z0-9_-]*$/, { message: 'Name must be URL safe.' }),
    title: z.string().min(1).max(200),
    introduction: z.string().optional(),
    about: z.string().max(140).optional(),
    revision: z.string().nonempty(),
    collaborators: z.array(z.string()),
});

export type ICreatePublication = z.infer<typeof CreatePublicationSchema>;

export const EditPublicationSchema = CreatePublicationSchema.partial();

export type IEditPublication = z.infer<typeof EditPublicationSchema>;
