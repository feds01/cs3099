/**
 * Function that generates initials from provided first and last names of
 * a user.
 *
 * @param name The full name of the user.
 * @returns The initials, based on the first and last name provided.
 */
export function getUserInitials(name: string): string {
    return name
        .split(' ')
        .map((name) => name.charAt(0))
        .join('');
}
