import { constantSequence } from '../creation/sequence';
import { struct } from '../creation/struct';
import { integerGenerator } from '../library/primitives';
import { many } from './many';

describe('Data Generators: Many', () => {
    it('should create a generator that creates multiple of the source generator output', () => {
        const gen = integerGenerator(0, 100).pipe(many(5));
        const result = gen.create();

        expect(result.length).toBe(5);
        expect(result.every((n) => Number.isInteger(n) && n >= 0 && n <= 100)).toBe(true);
    });

    it('should work with sequences', () => {
        const gen = constantSequence(4, 3, 2, 1).many(4);
        const result = gen.create();

        expect(result).toEqual([4, 3, 2, 1]);
    });

    it("shouldn't over-emit", () => {
        const gen = constantSequence(4, 3, 2, 1).many(10);
        const result = gen.create();

        expect(result).toEqual([4, 3, 2, 1]);
    });

    it('should work with structs containing sequences', () => {
        const gen = struct({
            id: [4, 3, 2, 1],
            name: ['Item 4', 'Item 3', 'Item 2', 'Item 1']
        }).many(4);
        const result = gen.create();

        expect(result).toEqual([
            {
                id: 4,
                name: 'Item 4'
            },
            {
                id: 3,
                name: 'Item 3'
            },
            {
                id: 2,
                name: 'Item 2'
            },
            {
                id: 1,
                name: 'Item 1'
            }
        ]);
    });
});
