export function range(size: number, startAt: number = 0): ReadonlyArray<number> {
    return Array.from({ length: size }, (x, i) => i);
}
