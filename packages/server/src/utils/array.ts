/**
 * Utility function that will reduce a given array to it's duplicates.
 *
 * @param array - The array to be reduced to it's duplicates
 * @returns An array representing all of the duplicates in the array
 */
export function reduceToDuplicates<T>(array: T[]): T[] {
    const uniqueElements = new Set();
    const nonUniqueElements = new Set<T>();

    array.forEach((item) => {
        if (uniqueElements.has(item)) {
            nonUniqueElements.add(item);
        } else {
            uniqueElements.add(item);
        }
    });

    return [...nonUniqueElements];
}

/**
 * Checks if two sets are equal
 *
 * @param left - The left hand-side set
 * @param right - The right hand-side set
 * @returns If the two sets have equal number of elements
 */
export function setsEqual<T>(left: Set<T>, right: Set<T>): boolean {
    if (left.size !== right.size) return false;

    for (const a of left) if (!right.has(a)) return false;
    return true;
}
