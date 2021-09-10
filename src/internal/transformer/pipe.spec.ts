import { flatMap, map } from './map';
import { pipe } from './pipe';

describe('Data Generators: Pipe', () => {
    it('should pipe iterables with transformers', () => {
        const it = () => [1, 2, 3];

        const gen = pipe(
            it,
            map((n) => n * 2),
            flatMap((n) => [n, n - 1])
        );
        expect([...gen()]).toEqual([2, 1, 4, 3, 6, 5]);
    });
});
