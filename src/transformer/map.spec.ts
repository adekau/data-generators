import { DataGenerator } from '../interfaces/data-generator.interface';
import { charGenerator, integerGenerator, numberGenerator, stringGenerator } from '../library/primitives';
import { withDefault } from './default';
import { many } from './many';
import { dgFlatMap, dgMap } from './map';
import { optional } from './optional';

describe('Data Generators: Map', () => {
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
