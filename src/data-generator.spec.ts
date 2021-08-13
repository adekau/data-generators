import { createGenerator, dgFlatMap, dgMap } from './data-generator';
import { DataGenerator } from './data-generator.interface';
import { withDefault } from './default';
import { many } from './many';
import { optional } from './optional';
import { booleanGenerator, charGenerator, integerGenerator, numberGenerator, stringGenerator } from './primitives';

describe('Data Generators: Data Generator', () => {
    it('should create a data generator', () => {
        const gen = createGenerator(() => 'test');

        expect(gen.create()).toBe('test');
    });

    it('should create a data generator that can create many items', () => {
        let i = 0;
        const gen = createGenerator(() => i++);
        expect(gen.createMany(10)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should apply an inner function', () => {
        const genFn = createGenerator(() => (n: number) => n * 10);
        const newGen = integerGenerator(1, 5).ap(genFn);

        expect(newGen.create()).toBeGreaterThan(5);
    });

    it('should flatMap', () => {
        const randomProbabilityGenerator = numberGenerator(0, 100);
        const spy = jasmine.createSpy('booleanGenerator', booleanGenerator).and.callThrough();
        const gen = randomProbabilityGenerator.flatMap(spy);

        const results = gen.createMany(3);

        expect(results.length).toBe(3);
        expect(results.every((x) => typeof x === 'boolean')).toBeTrue();
        expect(spy).toHaveBeenCalledTimes(3);
    });

    describe('pipe', () => {
        it('should pipe map', () => {
            const gen = numberGenerator().pipe(dgMap((num) => num.toString()));

            expect(gen.create()).toBeInstanceOf(String);
        });

        it('should pipe flatMap', () => {
            const gen = integerGenerator(1, 10).pipe(dgFlatMap(stringGenerator));

            const result = gen.createMany(5);
            expect(result.every((s) => typeof s === 'string')).toBeTrue();
            expect(result.every((s) => s.length <= 10 && s.length >= 1)).toBeTrue();
        });

        it('should pipe 9 functions', () => {
            const gen = integerGenerator(1, 5).pipe(
                dgMap((num) => num + 20),
                dgFlatMap(stringGenerator),
                optional(50),
                withDefault(charGenerator),
                many(4),
                optional(),
                withDefault(charGenerator.pipe(many(3))),
                dgMap((strs) => strs.map((str) => str.length)),
                dgFlatMap(
                    (nums): DataGenerator<string | number> =>
                        nums.every((num) => num === 1) ? charGenerator : integerGenerator(1, 10)
                )
            );
            expect(
                gen.createMany(5).every((x) => (typeof x === 'string' ? x.length === 1 : x >= 1 && x <= 10))
            ).toBeTrue();
        });
    });
});
