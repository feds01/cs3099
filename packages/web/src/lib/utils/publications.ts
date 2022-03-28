/** Type representing an index for a publication */
export interface PublicationIndex {
    /** The username of the publication owner */
    username: string;
    /** The URL name of the publication */
    name: string;
    /** An optional revision specifier, if undefined then the current revision is specified */
    revision?: string;
}

/**
 * Function to convert a @see PublicationIndex into a path.
 *
 * @param index - The publication index to use
 * @param omitRevision - Whether or not to emit the revision regardless if the index has one or not.
 * @returns - A converted path
 */
export function constructBasePath(index: PublicationIndex, omitRevision = false) {
    const { username, name, revision } = index;
    let items = [username, name];

    if (!omitRevision && typeof revision !== 'undefined') {
        items.push(revision);
    }

    return '/' + items.join('/');
}
