import { Head } from 'ts-toolbelt/out/List/Head';
import { DataGenerator, Tail } from '../interfaces/data-generator.interface';
import { createGenerator } from './data-generator';

type IterableTuple<T extends Iterable<unknown>[], Final extends unknown[] = []> = {
    0: Head<T> extends Iterable<infer U> ? IterableTuple<Tail<T>, [...Final, U]> : Final;
    1: Final;
}[T['length'] extends 0 ? 1 : 0];

/**
 * Similar to struct, but in a fixed length array format.
 *
 * @category Creation
 * @param generators comma separated generators in order of how the tuple will output
 * @returns a tuple of values in order of the input generators.
 * @see struct
 * @example
 * ```
 * tuple(stringGenerator(6), integerGenerator(), booleanGenerator()).create();
 * // Example Output: ['hZn,*Q', 3, false]
 * ```
 */
export function tuple<T extends Iterable<unknown>[]>(...gens: T): DataGenerator<IterableTuple<T>> {
    return createGenerator(_tuple(...gens));
}

export function _tuple<T extends Iterable<unknown>[]>(...generators: T): () => Iterable<IterableTuple<T>> {
    return function* () {
        const iterators = generators.map((dg) => dg[Symbol.iterator]());

        while (true) {
            const result = [];
            for (const it of iterators) {
                const { value, done } = it.next();
                if (done) {
                    return;
                }
                result.push(value);
            }
            yield result as IterableTuple<T>;
        }
    };
}
