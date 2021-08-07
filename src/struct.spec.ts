import { constant } from './constant';
import { DataGenerator } from './data-generator.interface';
import { enumValueGenerator } from './enum';
import { booleanGenerator, charGenerator, integerGenerator, numberGenerator, stringGenerator } from './primitives';
import { constantSequence } from './sequence';
import { struct, withOverrides } from './struct';
import { defer } from './defer';
import { uuidGenerator } from './uuid-generator';

enum EyeColor {
    Blue = 'blue',
    Brown = 'brown',
    Green = 'green'
}

interface TestPerson {
    eyeColor: EyeColor;
    height: number;
    weight: number;
    firstName: string;
    middleInitial: string;
    lastName: string;
}
describe('Data Generators: Struct', () => {
    it('should generate an interface', () => {
        const gen = struct<TestPerson>({
            eyeColor: enumValueGenerator(EyeColor),
            height: integerGenerator(150, 200),
            weight: numberGenerator(160, 200),
            firstName: stringGenerator(6),
            lastName: stringGenerator(8),
            middleInitial: charGenerator
        });
        const result = gen.create();

        expect(result.eyeColor === EyeColor.Blue || result.eyeColor === EyeColor.Brown || result.eyeColor === EyeColor.Green).toBeTrue();
        expect(Number.isInteger(result.height)).toBeTrue();
        expect(result.height >= 150 && result.height <= 200).toBeTrue();
        expect(result.weight).toBeInstanceOf(Number);
        expect(result.weight >= 160 && result.weight <= 200).toBeTrue();
        expect(result.firstName).toBeInstanceOf(String);
        expect(result.firstName.length).toBe(6);
        expect(result.lastName).toBeInstanceOf(String);
        expect(result.lastName.length).toBe(8);
        expect(result.middleInitial).toBeInstanceOf(String);
        expect(result.middleInitial.length).toBe(1);
    });

    describe('structWithOverrides', () => {
        const gen = withOverrides(struct({
            num: numberGenerator(5, 10),
            str: stringGenerator()
        }));
        it('should allow overriding struct generators', () => {
            expect(
                gen({
                    num: constant(16)
                }).create()
            ).toEqual({
                num: 16,
                str: jasmine.any(String)
            });

            expect(
                gen({ num: integerGenerator(20, 30), str: charGenerator })
                    .createMany(4)
                    .every(({ num, str }) => num >= 20 && num <= 30 && str.length === 1)
            ).toBeTrue();
        });

        it('should default to struct with no provided overrides', () => {
            expect(gen().create().str.length).toBe(10);
            expect(
                gen()
                    .createMany(4)
                    .every(({ num, str }) => num >= 5 && num <= 10 && str.length === 10)
            ).toBeTrue();
        });
    });
});
