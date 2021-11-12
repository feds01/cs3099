import { promises as fs } from 'fs';

/**
 * Wrapper function for fs.rename. Moves a file from a source to a
 * location.
 *
 * @param from - The current location of the file.
 * @param to - The destination location of the file.
 */
export async function moveFile(from: string, to: string): Promise<void> {
    await fs.rename(from, to);
}
