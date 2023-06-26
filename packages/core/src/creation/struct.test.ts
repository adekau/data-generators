import { charGenerator, integerGenerator, numberGenerator, stringGenerator } from '../library/primitives';
import { enumValueGenerator } from '../library/enum';
import { struct } from './struct';

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
});
