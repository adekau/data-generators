import { incrementGenerator } from './increment';
import { stringGenerator } from './primitives';

describe('Data Generators: Increment', () => {
    it('should increment', () => {
        const gen = incrementGenerator();
        expect(incrementGenerator().createMany(5)).toEqual([0, 1, 2, 3, 4]);
        expect(gen.createMany(5)).toEqual([0, 1, 2, 3, 4]);
        expect(gen.createMany(2)).toEqual([0, 1]);
    });

    it('should increment starting at input number', () => {
        const gen = incrementGenerator(100);
        expect(gen.createMany(5)).toEqual([100, 101, 102, 103, 104]);
    });

    it('maps to other generators', () => {
        // this example creates strings of incrementing lengths, with step 2
        const gen = incrementGenerator(5)
            .map((num) => num * 2)
            .flatMap((n) => stringGenerator(n).one());
        expect(gen.create().length).toEqual(10);

        const results = gen.createMany(3);
        const [result1, result2, result3] = results;
        expect(results.every((x) => typeof x === 'string')).toBe(true);
        expect(result1.length).toBe(10);
        expect(result2.length).toBe(12);
        expect(result3.length).toBe(14);
    });
});
