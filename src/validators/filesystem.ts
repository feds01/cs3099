import { z } from 'zod';

export const FilePathSchema = z.string().regex(/^\/[a-zA-Z0-9_/-]*$/);
