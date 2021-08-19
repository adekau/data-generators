import { constant } from '../creation/constant';
import { DataGenerator } from '../data-generator.interface';

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
    <T>(defaultGenerator: DataGenerator<T>) =>
    /**
     * @param dg Data Generator for which to use a default generator in place of undefined values
     * @returns a new generator, replacing undefined with a value from the default generator
     */
    (dg: DataGenerator<T | undefined>) =>
        dg.flatMap((out) => (out ? constant(out) : defaultGenerator));
