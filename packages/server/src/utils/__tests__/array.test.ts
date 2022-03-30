import { reduceToDuplicates, setsEqual } from '../array';

describe('array tests', () => {
    it('array duplicates are found', () => {
        const a = [1, 2, 2, 3];
        expect(reduceToDuplicates(a)).toStrictEqual([2]);

        const b = [1, 2, 3];
        expect(reduceToDuplicates(b)).toStrictEqual([]);

        const c = [1, 2, 2, 3, 1];
        expect(reduceToDuplicates(c)).toEqual(expect.arrayContaining([1, 2]));
    });

    it('expect `setsEqual` to find equals', () => {
        const a = new Set<number>([1, 2, 3, 4]);
        const b = new Set<number>([1, 2, 3, 4]);
        expect(setsEqual(a, b)).toBe(true);

        const c = new Set<number>([1, 2, 3, 4]);
        const d = new Set<number>([1, 2, 3, 4, 1, 2, 4, 3]);
        expect(setsEqual(c, d)).toBe(true);

        const e = new Set<number>([]);
        expect(setsEqual(e, e)).toBe(true);
    });

    it('expect `setsEqual` to not find equal', () => {
        const a = new Set<number>([1, 2, 3, 4]);
        const b = new Set<number>([1, 2, 3, 5]);

        expect(setsEqual(a, b)).toBe(false);

        const c = new Set<number>([1, 2, 4]);
        const d = new Set<number>([1, 4]);

        expect(setsEqual(c, d)).toBe(false);
    });
});
