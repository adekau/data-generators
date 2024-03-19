import { infinite } from '../creation/infinite';
import { tuple } from '../creation/tuple';

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
        return () =>
            infinite(() => {
                const gen = baseGenerator()[Symbol.iterator]() as unknown as Iterable<T>;
                return tuple(...Array.from({ length }).map(() => gen)).create();
            });
    };
