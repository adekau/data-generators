import { createGenerator } from '../creation/data-generator';
import { DataGenerator } from 'semble-ts/interfaces';
import { charGenerator, integerGenerator, numberGenerator, stringGenerator } from '../library/primitives';
import { withDefault } from './default';
import { many } from './many';
import { flatMap, map } from './map';
import { optional } from './optional';
import { iif } from '../creation/iif';

describe('Data Generators: Map', () => {
    describe('pipe', () => {
        it('should pipe map', () => {
            const gen = numberGenerator().pipe(map((num) => num.toString()));

            expect(gen.create()).toBeInstanceOf(String);
        });

        it('should pipe flatMap', () => {
            const gen = integerGenerator(1, 10).pipe(flatMap((n) => stringGenerator(n).one()));

            const result = gen.createMany(5);
            expect(result.every((s) => typeof s === 'string')).toBeTrue();
            expect(result.every((s) => s.length <= 10 && s.length >= 1)).toBeTrue();
        });

        it('should flatMap', () => {
            const gen = createGenerator(() => [true, false, true, false]).pipe(
                flatMap((bool) => iif(() => bool, ['hello', ['world']], [[[1]], 2]))
            );

            const results = gen.createAll();
            expect(results.length).toBe(8);
            expect(results).toEqual(['hello', 'world', 1, 2, 'hello', 'world', 1, 2]);
        });

        it('should pipe 9 functions', () => {
            const gen = integerGenerator(1, 5).pipe(
                map((num) => num + 20),
                flatMap(() => stringGenerator().one()),
                optional(50),
                withDefault(charGenerator),
                many(4),
                optional(),
                withDefault(charGenerator.pipe(many(3))),
                map((strs) => strs.map((str) => str.length)),
                flatMap(
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
