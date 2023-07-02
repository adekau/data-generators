import { booleanGenerator, charGenerator, integerGenerator, numberGenerator, stringGenerator } from './primitives';

describe('Data Generators: Primitives', () => {
    it('should generate a number', () => {
        const result = numberGenerator(5, 10).create();
        expect(result).toEqual(expect.any(Number));
        expect(result >= 5 && result <= 10).toBe(true);
    });

    it('should generate an integer', () => {
        const result = integerGenerator(5, 10).create();
        expect(Number.isInteger(result)).toBe(true);
        expect(result >= 5 && result <= 10).toBe(true);
    });

    it('should generate a boolean', () => {
        const result = booleanGenerator().create();
        expect(result).toEqual(expect.any(Boolean));
    });

    it('should generate a boolean with probability', () => {
        const result1 = booleanGenerator(100).create();
        expect(result1).toBe(true);

        const result2 = booleanGenerator(0).create();
        expect(result2).toBe(false);
    });

    it('should generate a character', () => {
        const result = charGenerator.create();
        expect(result).toEqual(expect.any(String));
        expect(result.length).toBe(1);
    });

    it('should generate a string', () => {
        const result = stringGenerator().create();
        expect(result).toEqual(expect.any(String));
        expect(result.length).toBe(10);
    });

    it('should generate a string of input length', () => {
        const result = stringGenerator(15).create();
        expect(result).toEqual(expect.any(String));
        expect(result.length).toBe(15);
    });
});
