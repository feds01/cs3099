import { z } from 'zod';

/**
 * This schema is used for the Export publication form, specifying to which service the export
 * should be sent and whether or not to export reviews.
 */
export const ExportPublicationSchema = z.object({
    exportReviews: z.boolean(),
    to: z.string().nonempty(),
});

export type IExportPublication = z.infer<typeof ExportPublicationSchema>;
