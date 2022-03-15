import { z } from 'zod';

/** Schema for validating various options that are provided to exporting endpoints. */
export const ExportPublicationOptionsSchema = z.object({
    exportReviews: z.boolean(),
});
