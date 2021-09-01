import { integerGenerator } from '../library/primitives';
import { take } from './take';

describe('Data Generators: Take', () => {
    it('should narrow an infinite generator to a finite generator', () => {
        const gen = integerGenerator().pipe(take(5));
        const results = gen.createAll();

        expect(results.length).toBe(5);
        expect(results).toEqual([
            jasmine.any(Number),
            jasmine.any(Number),
            jasmine.any(Number),
            jasmine.any(Number),
            jasmine.any(Number)
        ]);
    });
});
