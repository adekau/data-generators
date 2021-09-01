import { createGenerator } from '../creation/data-generator';
import { booleanGenerator, integerGenerator } from '../library/primitives';
import { flat } from './flat';
import { take } from './take';

describe('Data Generators: Flat', () => {
    it('should flatten a generator', () => {
        const gen = createGenerator(() => [
            booleanGenerator().pipe(take(4)),
            integerGenerator().pipe(take(3)),
            [1, 2, 3]
        ]);
        expect(gen.createAll().length).toBe(3);

        const flatGen = gen.pipe(flat());
        const results = flatGen.createAll();
        expect(results.length).toBe(10);
        expect(results).toEqual([
            jasmine.any(Boolean),
            jasmine.any(Boolean),
            jasmine.any(Boolean),
            jasmine.any(Boolean),
            jasmine.any(Number),
            jasmine.any(Number),
            jasmine.any(Number),
            1,
            2,
            3
        ]);
    });
});
