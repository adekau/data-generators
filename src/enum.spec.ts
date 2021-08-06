import { enumValueGenerator } from './enum';

enum TestEnum {
    Green = 'green',
    Blue = 'blue',
    Red = 'red',
    Invalid = 5
}

describe('Data Generators: Enum', () => {
    it('should get an enum value', () => {
        const result = enumValueGenerator(TestEnum).createMany(10);

        expect(result.length).toBe(10);
        expect(result.every((x) => x === TestEnum.Blue || x === TestEnum.Green || x === TestEnum.Red || x === TestEnum.Invalid)).toBeTrue();
    });
});
