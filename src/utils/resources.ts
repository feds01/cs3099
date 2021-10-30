import path from 'path';

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
