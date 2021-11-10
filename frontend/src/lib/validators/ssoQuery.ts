import { z } from "zod";

export const SsoQuerySchema = z.object({
    from: z.string().url(),
    state: z.string(),
});

export type SsoQuery = z.infer<typeof SsoQuerySchema>;


