/**
 * Utility function to sanitise a string input so that it can be used for
 * searching with regex within the database.
 *
 * @param value - The unsafe string
 * @returns - Escaped string
 */
export function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
