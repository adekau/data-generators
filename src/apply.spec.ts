import { apS, dgAp } from './apply';
import { constant } from './constant';
import { createGenerator } from './data-generator';
import { booleanGenerator, integerGenerator, stringGenerator } from './primitives';
import { struct } from './struct';

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
            const apgen = createGenerator(() => (num: number) => num > 5);
            const gen = integerGenerator(1, 10).pipe(dgAp(apgen));

            const result = gen.createMany(5);
            expect(result.every((bool) => typeof bool === 'boolean')).toBeTrue();
        });
    });
});
