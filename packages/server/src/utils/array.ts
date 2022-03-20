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
