import { createGenerator } from './creation/data-generator';
import { isDataGenerator } from './is-data-generator';

describe('Data Generators: isDataGenerator', () => {
    function* gen() {
        yield 1;
    }

    it('should return true for a data generator', () => {
        const g = createGenerator(gen);

        expect(isDataGenerator(g)).toBe(true);
    });

    it('should return false for a non data generator', () => {
        expect(isDataGenerator(gen)).toBe(false);
    });
});
