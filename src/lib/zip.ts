import AdmZip, { IZipEntry } from 'adm-zip';
import { promises as fs } from 'fs';

import { ApiError } from '../common/errors';
import Logger from '../common/logger';
import { expr } from '../utils/expr';
import {
    getPathBase,
    getPathComponents,
    joinPathsForResource,
    joinPathsRaw,
    stripEndingSlash,
} from '../utils/resources';

// Interface representing either a file entry or a directory entry
interface DirectoryEntry {
    type: 'file' | 'directory';
    filename: string;
    updatedAt: number;
}

// Interface representing a particular publication entry. If the entry is a file,
// then the contents of the file will be stored in the type. If the entry type is a
// directory, then the directory's contents are listed using a directory entry.
type PublicationPathContent =
    | {
          type: 'file';
          contents: string; // UTF8 text file
      }
    | {
          type: 'directory';
          entries: DirectoryEntry[];
      };

// Interface representing the physical location of an archive on the filesystem using
// the owner's user id, archive name and revision number to locate the physical archive.
export interface ArchiveIndex {
    userId: string;
    name: string;
    revision?: string;
}

// Type representing any resource that can be stored on disk
export interface ResourceIndex {
    type: 'avatar' | 'attachment' | 'publication';
    owner: string;
    name: string;
    path?: string[];
}

/**
 * Function to convert an ArchiveIndex into a filesystem path.
 *
 * @param archive - The entry describing the archives location in the file system.
 * @returns - A path representation of the archive index.
 */
export function archiveIndexToPath(archive: ArchiveIndex): string {
    // Append the revision path if there is one
    if (typeof archive.revision !== 'undefined') {
        return joinPathsForResource(
            'publication',
            archive.userId,
            archive.name,
            'revisions',
            archive.revision,
            'publication.zip',
        );
    }

    return joinPathsForResource('publication', archive.userId, archive.name, 'publication.zip');
}

/**
 * Function to convert a ResourceIndex into a filesystem path.
 *
 * @param resource - The entry describing the resource in the filesystem.
 *
 * @returns - A path representation of the resource index.
 */
export function resourceIndexToPath(resource: ResourceIndex): string {
    const base = joinPathsForResource(resource.type, resource.owner, resource.name);

    if (typeof resource.path !== 'undefined') {
        return joinPathsRaw(base, joinPathsRaw(...resource.path));
    }

    return base;
}

/**
 * Attempt to load a ZIP archive from a raw file path. This is primarily done
 * when zip files are being verified/loaded pre-resource stage.
 *
 * @param filePath - The path of the archive.
 *
 */
 export function loadArchiveFromPath(filePath: string): AdmZip | null {
    try {
        return new AdmZip(filePath);
    } catch (e: unknown) {
        return null;
    }
}

/**
 * Function to find and load the archive from the filesystem using an ArchiveIndex entry.
 *
 * @param archive - The entry describing the archives location in the file system.
 */
export function loadArchive(archive: ArchiveIndex): AdmZip | null {
    return loadArchiveFromPath(archiveIndexToPath(archive));
}

/**
 * Function to create an archive and save it to a particular location. The provided
 * archive index is the location that the location will use as the save the archive
 * to.
 *
 * @param archive - The index of the archive or a raw file path to the location
 *                of the zip file.
 * @param file -  The location of the file to use when adding to the archive.
 */
export async function createArchive(archive: ArchiveIndex | string, filePath: string) {
    const zip = expr(() => {
        if (typeof archive === 'string') {
            return loadArchiveFromPath(archive);
        }
            return loadArchive(archive);
    });

    if (!zip) throw new Error("Couldn't load archive");

    const base = getPathBase(filePath);

    // TODO: assert here that the path to the resource is an actual file and has an acceptable
    // mime-type to be zipped.
    const buf = await fs.readFile(filePath);
    const savePath = typeof archive === 'string' ? archive : archiveIndexToPath(archive);

    zip.addFile(base, buf);
    zip.writeZip(savePath);
}

function filterEntries(entries: IZipEntry[], prefix: string): DirectoryEntry[] {
    return entries
        .filter((e) => {
            if (!e.entryName.startsWith(prefix)) return false;

            const [_, lastPath] = e.entryName.split(prefix);
            if (typeof lastPath === 'undefined') return false;

            const components = getPathComponents(lastPath);
            return components.length === 1;
        })
        .map((e) => {
            // since this library has a different concept of name for directory and filename, we
            // have to handle the case where there is a directory; extracting the name of the
            // dir by full path.
            const components = getPathComponents(e.entryName);
            const transformedName = components[components.length - 1] ?? e.entryName;

            return {
                type: e.isDirectory ? 'directory' : 'file',
                filename: e.isDirectory ? transformedName : e.name,
                updatedAt: e.header.time.getTime(),
            };
        });
}

function findEntry(zip: AdmZip, path: string) {
    const strippedPath = stripEndingSlash(path);

    return zip.getEntries().find((e) => {
        const entryPath = stripEndingSlash(e.entryName);

        return strippedPath === entryPath;
    });
}

/**
 * Function to get an entry from the a archive index. The function will generate
 * information about the entry if it is either a file or a directory, returning a
 * @see{PublicationPathContent} describing the entry.
 *
 * @param archive - The entry describing the archives location in the file system.
 * @param path - Path in the archive to the actual folder
 * @returns The transformed entry or null if the entry doesn't exist.
 */
export function getEntry(
    archive: ArchiveIndex | string,
    path: string,
): PublicationPathContent | null {
    const zip = expr(() => {
        if (typeof archive === 'string') {
            return loadArchiveFromPath(archive);
        }
            return loadArchive(archive);
    });

    if (!zip) return null;

    try {
        // We have to handle a special case here where the actual path provided is '/'.
        // In this situation, we essentially have to find all the top level (probably only)
        // a single entry name.
        if (path === '') {
            const entries = filterEntries(
                zip.getEntries().filter((x) => getPathComponents(x.entryName).length === 1),
                '',
            );

            return {
                type: 'directory',
                entries,
            };
        }

        const entry = findEntry(zip, path);
        if (!entry) return null;

        // check if the entry is a directory or a string
        if (entry.isDirectory) {
            // get all the paths and filter out all the entries that don't begin with that name...
            const entries: DirectoryEntry[] = filterEntries(zip.getEntries(), entry.entryName);

            return {
                type: 'directory',
                entries,
            };
        }

        // Extract the contents of the file and return it...
        const contents = entry.getData().toString();

        return {
            type: 'file',
            contents,
        };
    } catch (e: unknown) {
        if (e instanceof Error) {
            Logger.error(`Encountered invalid zip file:\n${e.message}`);
        }

        throw new ApiError(400, 'Invalid ZIP Archive');
    }
}
