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
            expect.any(Boolean),
            expect.any(Boolean),
            expect.any(Boolean),
            expect.any(Boolean),
            expect.any(Number),
            expect.any(Number),
            expect.any(Number),
            1,
            2,
            3
        ]);
    });
});
