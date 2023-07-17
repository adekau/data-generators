import { functionGenerator } from '../library/function';
import { booleanGenerator, integerGenerator, numberGenerator, stringGenerator } from '../library/primitives';
import { constant } from './constant';
import { createGenerator } from './data-generator';
import { interpolate } from './interpolate';
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

    it('should error calling with on non-tuple/struct', () => {
        function testCreation() {
            numberGenerator().with('toString', functionGenerator(stringGenerator()));
        }
        const error = 'DataGenerator must be either a struct or tuple generator.';

        expect(testCreation).toThrowError(error);
    });

    it('should error calling without on non-tuple/struct', () => {
        function testCreation() {
            (numberGenerator() as any).without('toString');
        }
        const error = 'DataGenerator must be either a struct or tuple generator.';

        expect(testCreation).toThrowError(error);
    });

    it('should bind on a tuple', () => {
        const gen = tuple(numberGenerator(20, 99));
        const gen2 = gen.bind((a) => interpolate`you are ${constant(a[0])}`);
        const result = gen2.create();

        expect(result[0]).toEqual(expect.any(Number));
        expect(result[1]).toBe(`you are ${result[0]}`);
    });

    it('should bind on a struct', () => {
        const gen = struct({
            n: numberGenerator()
        });
        const gen2 = gen.bind('b', (a) => interpolate`you are ${constant(a.n)}`);
        const gen3 = gen2.bind('c', (a) => interpolate`woo! ${constant(a.b)}`);
        const result = gen3.create();

        expect(result.n).toEqual(expect.any(Number));
        expect(result.b).toBe(`you are ${result.n}`);
        expect(result.c).toBe(`woo! you are ${result.n}`);
    });

    it('should bind to a struct', () => {
        const gen = numberGenerator(20, 99).bindToStruct('num');
        const result = gen.create();

        expect(gen.type).toBe('struct');
        expect(result).toEqual({
            num: expect.any(Number)
        });
    });

    it('should bind to a tuple', () => {
        const gen = numberGenerator(20, 99).bindToTuple();
        const result = gen.create();

        expect(gen.type).toBe('tuple');
        expect(result).toEqual([expect.any(Number)]);
    });
});
