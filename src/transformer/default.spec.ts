import { constantSequence } from '../creation/sequence';
import { withDefault } from './default';
import { stringGenerator } from '../library/primitives';

describe('Data Generators: Default', () => {
    it('should default undefined values', () => {
        const gen = constantSequence(undefined, undefined, 'hello').pipe(withDefault(stringGenerator()));

        expect(gen.createAll()).toEqual([
            jasmine.objectContaining({ length: 10 }),
            jasmine.objectContaining({ length: 10 }),
            jasmine.objectContaining({ length: 5 }),
        ]);
    });
});
