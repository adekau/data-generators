import { apT } from '../transformer/apply';
import { constant } from './constant';
import { DataGenerator } from '../interfaces/data-generator.interface';

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
export function tuple<T1>(...generators: [DataGenerator<T1>]): DataGenerator<[T1]>;
export function tuple<T1, T2>(...generators: [DataGenerator<T1>, DataGenerator<T2>]): DataGenerator<[T1, T2]>;
export function tuple<T1, T2, T3>(
    ...generators: [DataGenerator<T1>, DataGenerator<T2>, DataGenerator<T3>]
): DataGenerator<[T1, T2, T3]>;
export function tuple<T1, T2, T3, T4>(
    ...generators: [DataGenerator<T1>, DataGenerator<T2>, DataGenerator<T3>, DataGenerator<T4>]
): DataGenerator<[T1, T2, T3, T4]>;
export function tuple<T1, T2, T3, T4, T5>(
    ...generators: [DataGenerator<T1>, DataGenerator<T2>, DataGenerator<T3>, DataGenerator<T4>, DataGenerator<T5>]
): DataGenerator<[T1, T2, T3, T4, T5]>;
export function tuple<T1, T2, T3, T4, T5, T6>(
    ...generators: [
        DataGenerator<T1>,
        DataGenerator<T2>,
        DataGenerator<T3>,
        DataGenerator<T4>,
        DataGenerator<T5>,
        DataGenerator<T6>
    ]
): DataGenerator<[T1, T2, T3, T4, T5, T6]>;
export function tuple<T1, T2, T3, T4, T5, T6, T7>(
    ...generators: [
        DataGenerator<T1>,
        DataGenerator<T2>,
        DataGenerator<T3>,
        DataGenerator<T4>,
        DataGenerator<T5>,
        DataGenerator<T6>,
        DataGenerator<T7>
    ]
): DataGenerator<[T1, T2, T3, T4, T5, T6, T7]>;
export function tuple<T1, T2, T3, T4, T5, T6, T7, T8>(
    ...generators: [
        DataGenerator<T1>,
        DataGenerator<T2>,
        DataGenerator<T3>,
        DataGenerator<T4>,
        DataGenerator<T5>,
        DataGenerator<T6>,
        DataGenerator<T7>,
        DataGenerator<T8>
    ]
): DataGenerator<[T1, T2, T3, T4, T5, T6, T7, T8]>;
export function tuple<T1, T2, T3, T4, T5, T6, T7, T8, T9>(
    ...generators: [
        DataGenerator<T1>,
        DataGenerator<T2>,
        DataGenerator<T3>,
        DataGenerator<T4>,
        DataGenerator<T5>,
        DataGenerator<T6>,
        DataGenerator<T7>,
        DataGenerator<T8>,
        DataGenerator<T9>
    ]
): DataGenerator<[T1, T2, T3, T4, T5, T6, T7, T8, T9]>;
export function tuple(...generators: DataGenerator<any>[]): DataGenerator<any[]> {
    return generators.reduce((prev, cur) => prev.pipe(apT(cur)), constant([]) as DataGenerator<any[]>);
}
