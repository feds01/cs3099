import Logger from '../common/logger';
import { promises as fs } from 'fs';

/**
 * Wrapper function for fs.rename. Moves a file from a source to a
 * location.
 *
 * @param from - The current location of the file.
 * @param to - The destination location of the file.
 */
export async function moveResource(from: string, to: string): Promise<void> {
    Logger.warn(`Attempting to move file: ${from} to ${to}`);
    await fs.rename(from, to);
}

/**
 * Wrapper function for fs.rmdir. Moves a file from a source to a
 * location.
 *
 * @param resource - The current location of the file.
 */
export async function deleteResource(resource: string): Promise<void> {
    Logger.warn(`Attempting to remove file: ${resource}`);
    await fs.rmdir(resource, { recursive: true });
}
