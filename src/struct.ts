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
export const struct = <T>(generators: { [K in keyof T]-?: DataGenerator<T[K]> }): DataGenerator<T> =>
    createGenerator(() => {
        return Object.keys(generators).reduce((acc, key) => {
            return {
                ...acc,
                [key]: generators[key as keyof typeof generators].create()
            };
        }, {} as { [K in keyof T]: T[K] });
    });

/**
 * Same as {@link struct}, but allows optional overrides of each property's generator.
 */
export const structWithOverrides = <T>(generators: { [K in keyof T]-?: DataGenerator<T[K]> }) => (generatorOverrides?: { [K in keyof T]+?: DataGenerator<T[K]> }) =>
    struct<T>(Object.assign({}, generators, generatorOverrides));
