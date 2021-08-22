import { booleanGenerator, numberGenerator, stringGenerator } from '../library';
import { anyOf } from './any-of';

describe('Data Generators: anyOf', () => {
    it('should pick any of the input generators', () => {
        const gen = anyOf(stringGenerator(), numberGenerator(), booleanGenerator());

        expect(
            gen.createMany(20).every((x) => typeof x === 'boolean' || typeof x === 'number' || typeof x === 'string')
        );
    });
});
