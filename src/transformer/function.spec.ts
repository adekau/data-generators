import { integerGenerator } from '../library/primitives';
import { toFunctionGenerator } from './function';

describe('Data Generators (Transformer): Function', () => {
    it('should convert a datagenerator to a function generator', () => {
        const gen = integerGenerator(1, 5).pipe(toFunctionGenerator());

        const functions = gen.createMany(3);
        expect(functions.every((fn) => typeof fn === 'function')).toBeTrue();
        expect(functions.every((fn) => fn() >= 1 && fn() <= 5)).toBeTrue();
    });
});
