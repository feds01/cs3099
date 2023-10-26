import { z } from 'zod';

/** Schema for verifying SSO requests on the frontend */
export const SsoQuerySchema = z.object({
    from: z.string().url(),
    state: z.string(),
});

export type SsoQuery = z.infer<typeof SsoQuerySchema>;
