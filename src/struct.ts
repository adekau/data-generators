import { createGenerator } from './data-generator';
import { DataGenerator } from './data-generator.interface';

/**
 * Creates a generator that generates an object adhering to an interface using the provided generators for
 * interface members. Can be thought of as behaving similarly to RxJS `forkJoin`.
 *
 * @param generators an object of generators matching the interface
 * @returns a generator that creates an object instance adhering to the interface
 * @example
 * struct({
 *     isRequired: booleanGenerator(),
 *     fieldId: integerGenerator(),
 *     value: stringGenerator(6)
 * }).create();
 * // Example Output: { isRequired: true, fieldId: 52, value: 'aVE3^x' }
 */
export const struct = <T>(generators: { [K in keyof T]: DataGenerator<T[K]> }): DataGenerator<T> =>
    createGenerator(() => {
        return Object.keys(generators).reduce((acc, key) => {
            return {
                ...acc,
                [key]: generators[key as keyof typeof generators].create()
            };
        }, {} as T);
    });

export const partialStruct = <T>(generators: { [K in keyof T]+?: DataGenerator<T[K]> }): DataGenerator<Partial<T>> =>
    createGenerator(() => {
        return Object.keys(generators).reduce((acc, key) => {
            return {
                ...acc,
                [key]: generators[key as keyof typeof generators]?.create()
            };
        }, {})
    })

/**
 * Creates a function that returns a new DataGenerator with properties of the original DataGenerator being optionally overridden.
 * 
 * @param dataGenerator The object DataGenerator to provide overrides for.
 * @returns a function that overrides the selected properties.
 */
export const withOverrides = <T extends Record<string, unknown>>(dataGenerator: DataGenerator<T>) => (generatorOverrides?: { [K in keyof T]+?: DataGenerator<T[K]> }): DataGenerator<T> =>
    dataGenerator.map((out) => Object.assign({}, out, partialStruct(generatorOverrides ?? {}).create()))
