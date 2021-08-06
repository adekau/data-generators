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
 * @param generators an object of generators matching the interface
 * @param manipulate expose the underlying struct DataGeneration to manipulate it with `map`, `flatMap`, etc.
 */
export function structWithOverrides<T>(generators: { [K in keyof T]-?: DataGenerator<T[K]> }): (generatorOverrides?: { [K in keyof T]+?: DataGenerator<T[K]> }) => DataGenerator<T>;
export function structWithOverrides<T, U>(generators: { [K in keyof T]-?: DataGenerator<T[K]> }, manipulate: (dg: DataGenerator<T>) => DataGenerator<U>): (generatorOverrides?: { [K in keyof T]+?: DataGenerator<T[K]> }) => DataGenerator<U>
export function structWithOverrides(...args: any[]): (generatorOverrides?: Record<string, unknown>) => any {
    return (generatorOverrides) => {
        if (args.length === 1)
            return struct(Object.assign({}, args[0], generatorOverrides));
        else
            return args[1](struct(Object.assign({}, args[0], generatorOverrides)));
    }
}

