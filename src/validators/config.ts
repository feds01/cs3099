import { z } from 'zod';

export const ConfigSchema = z.object({
    mongoURI: z.string().url(),
    jwtExpiry: z.string(),
    jwtRefreshExpiry: z.string(),
    jwtSecret: z.string(),
    jwtRefreshSecret: z.string(),
    resourcesFolder: z.string(),
});

export type ServerConfig = z.infer<typeof ConfigSchema>;
