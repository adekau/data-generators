import { DataGenerator } from './data-generator.interface';

/**
 * Creates a DataGenerator that generates functions for mock callbacks.
 *
 * @param returnValueGenerator The DataGenerator to use to generate the return value of the created function
 * @returns a new DataGenerator that generates functions that return a value from the returnValueGenerator
 */
export const functionGenerator = <T>(returnValueGenerator: DataGenerator<T>): DataGenerator<() => T> =>
    returnValueGenerator.map((out) => () => out);
