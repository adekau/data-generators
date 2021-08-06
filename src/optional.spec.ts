import { optional } from './optional';
import { integerGenerator } from './primitives';

describe('Data Generators: Optional', () => {
    it('should generate undefined values', () => {
        const gen = optional(integerGenerator(5, 10), 100);
        const result = gen.create();

        expect(result).toBeUndefined();
    });

    it('should generate values of the input generator type', () => {
        const gen = optional(integerGenerator(5, 10), 0);
        const result = gen.create();

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(Number);
    });
});