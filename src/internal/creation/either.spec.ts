import { integerGenerator, stringGenerator } from '../library/primitives';
import { either } from './either';

describe('Data Generators: Either', () => {
    it('should generate value A when probability is 100', () => {
        const gen = either(integerGenerator(), stringGenerator(), 100);
        const result = gen.create();

        expect(result).toBeInstanceOf(Number);
        expect(Number.isInteger(result)).toBeTrue();
    });

    it('should generate value B when probability is 0', () => {
        const gen = either(integerGenerator(), stringGenerator(), 0);
        const result = gen.create();

        expect(result).toBeInstanceOf(String);
    });

    it('should be either value A or B', () => {
        const gen = either(integerGenerator(), stringGenerator());
        const results = gen.createMany(10);

        expect(results.length).toBe(10);
        expect(results.every((x) => Number.isInteger(x) || typeof x === 'string')).toBeTrue();
    });
});
