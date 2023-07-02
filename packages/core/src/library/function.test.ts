import { functionGenerator, toFunctionGenerator } from './function';
import { integerGenerator } from './primitives';

describe('Data Generators (Library): Function', () => {
    it('should generate a function', () => {
        const gen = functionGenerator(integerGenerator(1, 5));

        const functions = gen.createMany(3);
        expect(functions.every((fn) => typeof fn === 'function')).toBe(true);
        expect(functions.every((fn) => fn() >= 1 && fn() <= 5)).toBe(true);
    });
});

describe('Data Generators (Transformer): Function', () => {
    it('should convert a datagenerator to a function generator', () => {
        const gen = integerGenerator(1, 5).pipe(toFunctionGenerator());

        const functions = gen.createMany(3);
        expect(functions.every((fn) => typeof fn === 'function')).toBe(true);
        expect(functions.every((fn) => fn() >= 1 && fn() <= 5)).toBe(true);
    });
});
