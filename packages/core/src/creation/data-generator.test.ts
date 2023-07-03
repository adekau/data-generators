import { booleanGenerator, integerGenerator, numberGenerator, stringGenerator } from '../library/primitives';
import { constant } from './constant';
import { createGenerator } from './data-generator';
import { struct } from './struct';
import { tuple } from './tuple';

describe('Data Generators: Data Generator', () => {
    it('should create a data generator', () => {
        const gen = createGenerator(() => ['test']);

        expect(gen.create()).toBe('test');
    });

    it('should create a data generator that can create many items', () => {
        let i = 0;
        const gen = createGenerator(function* () {
            while (true) {
                yield i++;
            }
        });
        expect(gen.createMany(10)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should apply an inner function', () => {
        const genFn = createGenerator(() => [(n: number) => n * 10]);
        const newGen = integerGenerator(1, 5).ap(genFn);

        expect(newGen.create()).toBeGreaterThan(5);
    });

    it('should flatMap', () => {
        const randomProbabilityGenerator = numberGenerator(0, 100);
        const gen = randomProbabilityGenerator.flatMap((n) => booleanGenerator(n));

        const results = gen.createMany(3);

        expect(results.length).toBe(3);
        expect(results.every((x) => typeof x === 'boolean')).toBe(true);
    });

    it('should with on a struct', () => {
        const gen = struct({ test: numberGenerator() });
        const result = gen.with('test', constant(50)).create();

        expect(result).toEqual({ test: 50 });
    });

    it('should with on a tuple', () => {
        const gen = tuple(numberGenerator());
        const result = gen.with(0, constant(60)).create();

        expect(result).toEqual([60]);
    });

    it('should without on a struct', () => {
        const gen = struct({
            a: numberGenerator(),
            b: stringGenerator(),
            c: booleanGenerator()
        }).without('b');
        const result = gen.create();

        expect(result).toEqual({ a: expect.any(Number), c: expect.any(Boolean) });
    });

    it('should without on a tuple', () => {
        const gen = tuple(numberGenerator(), stringGenerator()).without(1);
        const result = gen.create();

        expect(result).toEqual([expect.any(Number)]);
    });
});
