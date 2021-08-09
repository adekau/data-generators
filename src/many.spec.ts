import { many } from './many';
import { integerGenerator } from './primitives';

describe('Data Generators: Many', () => {
    it('should create a generator that creates multiple of the source generator output', () => {
        const gen = integerGenerator(0, 100).pipe(many(5));
        const result = gen.create();

        expect(result.length).toBe(5);
        expect(result.every((n) => Number.isInteger(n) && n >= 0 && n <= 100)).toBeTrue();
    });
});
