import { constant } from '../creation/constant';
import { createGenerator } from '../creation/data-generator';
import { struct } from '../creation/struct';
import { tuple } from '../creation/tuple';
import { booleanGenerator, integerGenerator, stringGenerator } from '../library/primitives';
import { ap, apS, apT } from './apply';

describe('Data Generators: Apply', () => {
    it('should apply into a struct', () => {
        const gen = constant({}).pipe(apS('a', booleanGenerator(100)), apS('b', stringGenerator()));

        expect(gen.create()).toEqual({
            a: true,
            b: jasmine.any(String)
        });
    });

    it('should append to a struct', () => {
        const gen = struct({
            a: booleanGenerator(100),
            b: constant('test')
        }).pipe(apS('c', stringGenerator()));

        expect(gen.create()).toEqual({
            a: true,
            b: 'test',
            c: jasmine.any(String)
        });
    });

    it('should append a struct to a struct', () => {
        const gen = struct({
            a: constant('test')
        }).pipe(apS('b', struct({ ab: constant('testtest') })));

        expect(gen.create()).toEqual({
            a: 'test',
            b: {
                ab: 'testtest'
            }
        });
    });

    describe('pipe', () => {
        it('should pipe apply', () => {
            const apgen = createGenerator(() => [(num: number) => num > 5]);
            const gen = integerGenerator(1, 10).pipe(ap(apgen));

            const result = gen.createMany(5);
            expect(result.every((bool) => typeof bool === 'boolean')).toBeTrue();
        });
    });

    describe('apT', () => {
        it('should append to a tuple', () => {
            const gen = tuple(constant(5), integerGenerator(), booleanGenerator()).pipe(apT(stringGenerator()));

            expect(gen.create().length).toBe(4);
            expect(gen.create()).toEqual([
                jasmine.any(Number),
                jasmine.any(Number),
                jasmine.any(Boolean),
                jasmine.any(String)
            ]);
        });
    });
});
