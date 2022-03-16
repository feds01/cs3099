import { z } from 'zod';

/** This schema is used to validate requests to create a publication */
export const CreatePublicationSchema = z.object({
    name: z
        .string()
        .min(1)
        .regex(/^[a-zA-Z0-9._~-]*$/, { message: 'Name must be URL safe.' }),
    title: z.string().min(1).max(200),
    introduction: z.string().optional(),
    about: z.string().max(140).optional(),
    revision: z
        .string()
        .min(1)
        .regex(/^[a-zA-Z0-9._~-]*$/, { message: 'Revision tag must be URL safe.' }),
    collaborators: z.array(z.string()),
});

export type ICreatePublication = z.infer<typeof CreatePublicationSchema>;

/** This schema is used to validate requests to update a publication */
export const EditPublicationSchema = CreatePublicationSchema.partial();

export type IEditPublication = z.infer<typeof EditPublicationSchema>;

/** This schema is used to validate revision requests on publications */
export const RevisePublicationSchema = z.object({
    revision: z
        .string()
        .min(1)
        .regex(/^[a-zA-Z0-9._~-]*$/, { message: 'Revision tag must be URL safe.' }),
    changelog: z.string(),
});

export type IRevisePublication = z.infer<typeof RevisePublicationSchema>;
