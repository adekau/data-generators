import { booleanGenerator, integerGenerator, numberGenerator } from '../library/primitives';
import { createGenerator } from './data-generator';

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
        expect(results.every((x) => typeof x === 'boolean')).toBeTrue();
    });
});
