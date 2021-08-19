import { partialStruct } from '../creation/struct';
import { DataGenerator } from '../data-generator.interface';

/**
 * Creates a function that returns a new DataGenerator with properties of the original DataGenerator being optionally overridden.
 *
 * @category Utility
 * @param dataGenerator The object DataGenerator to provide overrides for.
 * @returns a function that overrides the selected properties.
 */
export const withOverrides =
    () =>
    <T extends object>(dataGenerator: DataGenerator<T>) =>
    (generatorOverrides?: { [K in keyof T]+?: DataGenerator<T[K]> }): DataGenerator<T> =>
        dataGenerator.map((out) => Object.assign({}, out, partialStruct(generatorOverrides ?? {}).create()));
