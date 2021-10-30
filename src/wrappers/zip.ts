import AdmZip from 'adm-zip';
import assert from 'assert';
import { joinPaths } from '../utils/resources';

interface DirectoryEntry {
    type: 'file' | 'directory';
    filename: string;
}

type PublicationPathContent =
    | {
          type: 'file';
          contents: string; // UTF8 text file
      }
    | {
          type: 'directory';
          entries: DirectoryEntry[];
      };

interface ArchiveIndex {
    userId: string;
    name: string;
    revision?: string;
}

/**
 *
 */
// export async function createArchive(_archive: ArchiveIndex) {}

/**
 *
 */
function loadArchive(archive: ArchiveIndex) {
    let source;

    // Append the revision path if there is one
    if (typeof archive.revision !== 'undefined') {
        source = joinPaths(
            archive.userId,
            archive.name,
            'revisions',
            archive.revision,
            'publication.zip',
        );
    } else {
        source = joinPaths(archive.userId, archive.name, 'publication.zip');
    }

    return new AdmZip(source);
}

/**
 * 
 * @param archive - The entry describing the archives location in the file system.
 * @param path - 
 * @returns 
 */
export function getEntry(archive: ArchiveIndex, path: string): PublicationPathContent | null {
    const zip = loadArchive(archive);
    const entry = zip.getEntry(path);

    if (!entry) return null;

    // check if the entry is a directory or a string
    if (entry.isDirectory) {
        const prefix = entry.entryName;

        // get all the paths and filter out all the entries that don't begin with that name...
        const entries: DirectoryEntry[] = zip
            .getEntries()
            .filter((e) => {
                if (!e.entryName.startsWith(prefix)) return false;

                const [_, lastPath] = e.entryName.split(prefix);
                if (typeof lastPath === 'undefined') return false;

                const components = lastPath.split('/').filter((x) => x !== '');
                return components.length === 1;
            })
            .map((e) => {
                // since this library has a different concept of name for directory and filename, we
                // have to handle the case where there is a directory; extracting the name of the
                // dir by full path.
                const components = entry.entryName.split('/').filter((x) => x !== '');
                const transformedName = components[components.length - 1];
                assert(typeof transformedName !== 'undefined');

                return {
                    type: e.isDirectory ? 'directory' : 'file',
                    filename: e.isDirectory ? transformedName : e.name,
                };
            });

        return {
            type: 'directory',
            entries,
        };
    }
        const contents = entry.getData().toString();

        return {
            type: 'file',
            contents,
        };
}
