import { z } from 'zod';

export const ConfigSchema = z.object({
    mongoURI: z.string().url(),
    teamName: z.string().length(3),
    jwtExpiry: z.string(),
    jwtRefreshExpiry: z.string(),
    jwtSecret: z.string(),
    jwtRefreshSecret: z.string(),
    resourcesFolder: z.string().min(1),
    frontendURI: z.string().url(),
});

export type ServerConfig = z.infer<typeof ConfigSchema>;
