import { integerGenerator } from '../library/primitives';
import { optional } from './optional';

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

    it('pipes', () => {
        const gen = integerGenerator(5, 10).pipe(optional(0));
        const result = gen.create();

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(Number);
    });
});
