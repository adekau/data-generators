import { functionGenerator } from './function';
import { integerGenerator } from './primitives';

describe('Data Generators: Fucntion', () => {
    it('should generate a function', () => {
        const gen = functionGenerator(integerGenerator(1, 5));

        const functions = gen.createMany(3);
        expect(functions.every((fn) => typeof fn === 'function')).toBeTrue();
        expect(functions.every((fn) => fn() >= 1 && fn() <= 5)).toBeTrue();
    });
});
