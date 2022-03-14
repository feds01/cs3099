import { z } from 'zod';

// Schema for describing whether a given flag is toggled or not
export const FlagSchema = z.enum(['false', 'true']).transform((f) => f === 'true');

export const ExportPublicationSchema = z.object({
    exportReviews: FlagSchema,
    to: z.string().nonempty(),
});

export type IExportPublication = z.infer<typeof ExportPublicationSchema>;
