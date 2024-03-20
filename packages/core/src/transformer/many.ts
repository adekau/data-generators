import { pipe } from './pipe';
import { take } from './take';

/**
 * Creates a generator that returns an array of length `length` of outputs from `baseGenerator`.
 * Useful in, for example, `struct`.
 *
 * @category Transformer
 * @param baseGenerator the generator to generate many outputs from
 * @param length the number of outputs to generate
 * @returns a new generator that generates an array of outputs from `baseGenerator`
 * @example
 * ```
 * struct({
 *     letters: charGenerator.pipe(many(3))
 * }).create();
 * // { letters: ['a', 'Y', '3'] }
 * ```
 */
export const many =
    <T>(length: number) =>
    (baseGenerator: () => Iterable<T>): (() => Iterable<T[]>) => {
        return function* () {
            const gen = pipe(() => baseGenerator(), take(length));
            while (true) {
                yield [...gen()];
            }
        };
    };
