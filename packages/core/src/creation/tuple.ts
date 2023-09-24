import { DataGenerator } from '../data-generator.interface';
import { IterableTuple } from '../iterable-tuple.type';
import { IterableFactoryWithType, createGenerator } from './data-generator';

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
    return createGenerator(_tuple(...gens), 'tuple');
}

export function _tuple<T extends Iterable<unknown>[]>(...generators: T): IterableFactoryWithType<IterableTuple<T>> {
    return Object.assign(
        function* () {
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
        },
        {
            type: 'tuple' as const
        }
    );
}
