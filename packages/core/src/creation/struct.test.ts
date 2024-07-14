import { O } from 'ts-toolbelt';
import { DataGenerator } from '../data-generator.interface';
import { enumValueGenerator } from '../library/enum';
import { charGenerator, integerGenerator, numberGenerator, stringGenerator } from '../library/primitives';
import { WithoutT, withoutS } from '../transformer/with';
import { constant } from './constant';
import { either } from './either';
import { mergeStructs, struct } from './struct';
import { bindS } from '../transformer/bind';
import { apS } from '../transformer/apply';

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

describe('Data Generators (Creation): Struct', () => {
    const personGen = struct<TestPerson>({
        eyeColor: enumValueGenerator(EyeColor),
        height: integerGenerator(150, 200),
        weight: numberGenerator(160, 200),
        firstName: stringGenerator(6),
        lastName: stringGenerator(8),
        middleInitial: charGenerator
    });

    it('should generate an interface', () => {
        const result = personGen.create();

        expect(
            result.eyeColor === EyeColor.Blue ||
                result.eyeColor === EyeColor.Brown ||
                result.eyeColor === EyeColor.Green
        ).toBe(true);
        expect(Number.isInteger(result.height)).toBe(true);
        expect(result.height >= 150 && result.height <= 200).toBe(true);
        expect(result.weight).toEqual(expect.any(Number));
        expect(result.weight >= 160 && result.weight <= 200).toBe(true);
        expect(result.firstName).toEqual(expect.any(String));
        expect(result.firstName.length).toBe(6);
        expect(result.lastName).toEqual(expect.any(String));
        expect(result.lastName.length).toBe(8);
        expect(result.middleInitial).toEqual(expect.any(String));
        expect(result.middleInitial.length).toBe(1);
    });

    it('should merge structs together', () => {
        const structGen1 = struct({
            age: integerGenerator(),
            siblings: integerGenerator()
        });

        const structGen2 = struct({
            age: constant(25 as const),
            gpa: integerGenerator(1, 5),
            university: stringGenerator()
        });

        const merged = mergeStructs(personGen, structGen1, structGen2);
        const result = merged.create();

        expect(merged.type).toBe('struct');
        expect(
            result.eyeColor === EyeColor.Blue ||
                result.eyeColor === EyeColor.Brown ||
                result.eyeColor === EyeColor.Green
        ).toBe(true);
        expect(Number.isInteger(result.height)).toBe(true);
        expect(result.height >= 150 && result.height <= 200).toBe(true);
        expect(result.weight).toEqual(expect.any(Number));
        expect(result.weight >= 160 && result.weight <= 200).toBe(true);
        expect(result.firstName).toEqual(expect.any(String));
        expect(result.firstName.length).toBe(6);
        expect(result.lastName).toEqual(expect.any(String));
        expect(result.lastName.length).toBe(8);
        expect(result.middleInitial).toEqual(expect.any(String));
        expect(result.middleInitial.length).toBe(1);
        expect(result.age).toBe(25);
        expect(result.siblings >= 1 && result.siblings <= 100).toBe(true);
        expect(result.gpa >= 1 && result.gpa <= 5).toBe(true);
        expect(result.university.length).toBe(10);
    });
});
