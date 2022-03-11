import { constants, promises as fs } from 'fs';
import path from 'path';

import Logger from '../../common/logger';

/**
 * Wrapper function to check if a resource with a given path exists in the resource folder.
 *
 * @param resource The path to the resource to check
 *
 * @returns Boolean on whether or not the resource exists.
 */
export async function resourceExists(resource: string): Promise<boolean> {
    try {
        await fs.access(resource, constants.F_OK);
        return true;
    } catch (e: unknown) {
        return false;
    }
}

/**
 * Wrapper function for fs.rename. Moves a file from a source to a
 * location.
 *
 * @param from - The current location of the file.
 * @param to - The destination location of the file.
 */
export async function moveResource(from: string, to: string): Promise<void> {
    Logger.warn(`Attempting to move file: ${from} to ${to}`);

    // Here we need to check if the location 'to' exists, specifically the parent. If it does
    // not, then we need to create the directory before we move it.
    const dirname = path.dirname(to);

    if (!(await resourceExists(dirname))) {
        await fs.mkdir(dirname, { recursive: true });
    }

    await fs.rename(from, to);
}

/**
 * Wrapper function for fs.rmdir. Deletes a directory/file from a source to a
 * location.
 *
 * @param resource - The current location of the directory.
 */
export async function deleteResource(resource: string): Promise<void> {
    Logger.warn(`Attempting to remove directory: ${resource}`);
    await fs.rmdir(resource, { recursive: true });
}

/**
 * Wrapper function for fs.rm. Deletes a file from a source to a
 * location.
 *
 * @param resource - The current location of the file.
 */
export async function deleteFileResource(resource: string): Promise<void> {
    Logger.warn(`Attempting to remove file: ${resource}`);
    await fs.rm(resource);
}
