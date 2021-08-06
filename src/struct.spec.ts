import { enumValueGenerator } from './enum';
import { charGenerator, integerGenerator, numberGenerator, stringGenerator } from './primitives';
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
});
