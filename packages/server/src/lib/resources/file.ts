/**
 * Function to count lines of a given contents file path.
 *
 * @param contents: The contents to count lines in.
 * @returns The number of lines in the file
 */
export function countLines(contents: string): number {
    return contents.split(/\r\n|\r|\n/).length;
}
