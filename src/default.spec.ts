import { constantSequence } from './sequence';
import { withDefault } from './default';
import { stringGenerator } from './primitives';

describe('Data Generators: Default', () => {
    it('should default undefined values', () => {
        const gen = constantSequence(undefined, undefined, 'hello').pipe(withDefault(stringGenerator()));

		expect(gen.create().length).toBe(10);
		expect(gen.create().length).toBe(10);
		expect(gen.create().length).toBe(5);
		expect(gen.create().length).toBe(10);
    });
});
