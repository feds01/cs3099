import { FlagSchema } from '../api/models';

/**
 * Utility function to convert a boolean flag into a string equivalent
 * (primarily used within request query strings).
 *
 * @param flag - The flag to convert into the stringified version
 * @returns A @see FlagSchema
 */
export function intoFlag(flag: boolean): FlagSchema {
    return flag ? 'true' : 'false';
}
