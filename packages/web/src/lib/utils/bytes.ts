/**
 * This function is used to compute the size of a string that is encoded using
 * UCS-2(aka UTF-16).
 *
 * Taken from https://stackoverflow.com/a/63893237/9955666
 *
 * @param s - The string that is to be measured
 * @returns - The size of the string in bytes
 */
export function byteLength(s: string): number {
    //assuming the String is UCS-2(aka UTF-16) encoded
    let n = 0;
    for (let i = 0, l = s.length; i < l; i++) {
        const hi = s.charCodeAt(i);
        if (hi < 0x0080) {
            //[0x0000, 0x007F]
            n += 1;
        } else if (hi < 0x0800) {
            //[0x0080, 0x07FF]
            n += 2;
        } else if (hi < 0xd800) {
            //[0x0800, 0xD7FF]
            n += 3;
        } else if (hi < 0xdc00) {
            //[0xD800, 0xDBFF]
            const lo = s.charCodeAt(++i);

            if (i < l && lo >= 0xdc00 && lo <= 0xdfff) {
                //followed by [0xDC00, 0xDFFF]
                n += 4;
            } else {
                throw new Error('UCS-2 String malformed');
            }
        } else if (hi < 0xe000) {
            //[0xDC00, 0xDFFF]
            throw new Error('UCS-2 String malformed');
        } else {
            //[0xE000, 0xFFFF]
            n += 3;
        }
    }
    return n;
}

/**
 * Format bytes as human-readable text.
 *
 * Taken from https://stackoverflow.com/a/14919494/9955666
 *
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 *
 * @return Formatted string.
 */
export function humanFileSize(bytes: number, si = false, dp = 1): string {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
        return bytes + ' Bytes';
    }

    const units = si
        ? ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10 ** dp;

    do {
        bytes /= thresh;
        ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

    return bytes.toFixed(dp) + ' ' + units[u];
}
