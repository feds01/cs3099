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
    const prefix = process.env.RESOURCES_FOLDER;

    if (typeof prefix === 'undefined') {
        throw new Error("Environment variable 'RESOURCE_FOLDER' is undefined.");
    }

    return path.join(prefix, ...paths);
}

/**
 * Function to remove a slash from the end of a file path.
 *
 * @param filePath - The file path to transform.
 * @returns Slash stripped file path.
 */
export function stripEndingSlash(filePath: string): string {
    if (filePath !== '' && filePath[filePath.length - 1] === '/') {
        return filePath.slice(0, filePath.length - 1);
    }

    return filePath;
}

/**
 * Get the components from a path by splitting it on each slash. Additionally, we
 * want to remove any components in the file path that are empty strings.
 *
 * @param filePath - The path that is to be split
 * @returns - Path components excluding any empty parts.
 */
export function getPathComponents(filePath: string): string[] {
    return filePath.split('/').filter((x) => x !== '');
}

/**
 * Function to extract the base of a file path.
 *
 * @param filePath - The full path of a entry in the filesystem.
 * @returns The base of the path.
 */
export function getPathBase(filePath: string): string {
    return path.parse(filePath).base;
}

export function extractFile(req: express.Request): UploadedFile | null {
    if (!req.files || !req.files.file) {
        return null;
    }

    const { file } = req.files;
    return Array.isArray(file) ? null : file; // Ensure that is not an array
}
