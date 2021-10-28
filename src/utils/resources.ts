import path from 'path';
import express from 'express';
import { UploadedFile } from 'express-fileupload';

/**
 * Function to concatenate paths with the specified project resource folder.
 *
 * @param paths - Paths that should be concatenated with the resource folder.
 * @returns The concatenated path.
 */
export function joinPaths(...paths: string[]): string {
    const prefix = process.env['RESOURCES_FOLDER'];

    if (typeof prefix === 'undefined') {
        throw new Error("Environment variable 'RESOURCE_FOLDER' is undefined.");
    }

    return path.join(prefix, ...paths);
}

export function extractFile(req: express.Request): UploadedFile | null {
    if (!req.files || !req.files['file']) {
        return null;
    }

    const file = req.files['file'];
    return Array.isArray(file) ? null : file; // Ensure that is not an array
}
