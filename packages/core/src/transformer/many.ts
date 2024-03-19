import { _tuple } from '../creation/tuple';

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
        // DataGenerator makes an iterable "recyclable" where each time a value is pulled through a create method, it gets it from a new iterator.
        // If a DataGenerator is passed in, e.g. from constantSequence, get the raw iterator from it to prevent this recycling.
        const gen = baseGenerator()[Symbol.iterator]() as unknown as Iterable<T>;
        return () => _tuple(...Array.from({ length }).map(() => gen))();
    };
