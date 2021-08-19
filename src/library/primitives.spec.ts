import { booleanGenerator, charGenerator, integerGenerator, numberGenerator, stringGenerator } from './primitives';

describe('Data Generators: Primitives', () => {
    it('should generate a number', () => {
        const result = numberGenerator(5, 10).create();
        expect(result).toBeInstanceOf(Number);
        expect(result >= 5 && result <= 10).toBeTrue();
    });

    it('should generate an integer', () => {
        const result = integerGenerator(5, 10).create();
        expect(Number.isInteger(result)).toBeTrue();
        expect(result >= 5 && result <= 10).toBeTrue();
    });

    it('should generate a boolean', () => {
        const result = booleanGenerator().create();
        expect(result).toBeInstanceOf(Boolean);
    });

    it('should generate a boolean with probability', () => {
        const result1 = booleanGenerator(100).create();
        expect(result1).toBeTrue();

        const result2 = booleanGenerator(0).create();
        expect(result2).toBeFalse();
    });

    it('should generate a character', () => {
        const result = charGenerator.create();
        expect(result).toBeInstanceOf(String);
        expect(result.length).toBe(1);
    });

    it('should generate a string', () => {
        const result = stringGenerator().create();
        expect(result).toBeInstanceOf(String);
        expect(result.length).toBe(10);
    });

    it('should generate a string of input length', () => {
        const result = stringGenerator(15).create();
        expect(result).toBeInstanceOf(String);
        expect(result.length).toBe(15);
    });
});
