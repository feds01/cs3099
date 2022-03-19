import { z } from 'zod';

export const ExportPublicationSchema = z.object({
    exportReviews: z.boolean(),
    to: z.string().nonempty(),
});

export type IExportPublication = z.infer<typeof ExportPublicationSchema>;
