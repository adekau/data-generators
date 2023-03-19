import { DataGenerator } from '../interfaces/data-generator.interface';
import { Inner } from 'semble-ts/types';
import { constant } from './constant';
import { either } from './either';

/**
 * Creates a data generator that outputs a value from any of the input generators at random.
 *
 * @category Creation
 * @param generators Generators to pick any of for the next output
 * @returns a data generator that outputs a value from any of the input generators at random
 * @example
 * ```
 * anyOf(
 *     integerGenerator(1, 10),
 *     stringGenerator(5),
 *     booleanGenerator()
 * ).createMany(5);
 * // [4, true, 5, 'A6eBd', false]
 * ```
 */
export const anyOf = <T extends Iterable<unknown>[]>(...generators: T): DataGenerator<Inner<T>> => {
    return (
        generators.length
            ? generators.reduceRight((prev, next, i) => either(prev, next, 100 - 100 / (generators.length - i)))
            : constant(undefined)
    ) as DataGenerator<Inner<T>>;
};
