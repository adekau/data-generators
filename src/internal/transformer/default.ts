import { constant } from '../creation/constant';
import { DataGenerator } from '../interfaces/data-generator.interface';
import { flatMap, flatMapShallow } from './map';
import { one } from './one';

/**
 * Data Generator pipe operator for using a default generator in place of undefined outputs.
 *
 * @category Transformer
 * @param defaultGenerator default generator to use when undefined is outputted
 * @example
 * ```
 * const gen1 = optional(integerGenerator(1, 50)); // type: DataGenerator<number | undefined>
 * const gen2 = gen1.pipe(withDefault(integerGenerator(100, 150))) // type: DataGenerator<number>
 * gen2.createMany(5);
 * // [49, 38, 14, 124, 19]
 * // without withDefault, 124 would have been undefined
 * ```
 */
export const withDefault =
    <T>(defaultGenerator: Iterable<T>) =>
    (dg: () => Iterable<T | undefined>): (() => Iterable<T>) => {
        return () =>
            flatMapShallow((t: T | undefined) => (t ? [t] : one<T>()(() => defaultGenerator)()))(dg)() as Iterable<T>;
    };
