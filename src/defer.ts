import { DataGenerator } from './data-generator.interface';

/**
 * Defer projections on a data generator returned by a function until after the function is called. Useful on a `struct` data generator wrapped in `withOverrides` to keep
 * the original overrides in tact when manipulating the struct passed to `withOverrides` using `map`, `flatMap`, etc.
 *
 * @param dataGeneratorFn a function that returns a data generator
 * @param deferredProject a projection function that manipulates the returned data generator from `dataGeneratorFn` after the the returned function is called
 * @returns a proxy function with the same arguments as `dataGeneratorFn` and sends the output of `dataGeneratorFn` through `deferredProject`.
 * @example
 * // use case:
 * withOverrides(struct({ num1: numberGenerator(), num2: numberGenerator() }).map(({ num1, num2 }) => num1 + num2)); // type error, map caused the input to withOverloads to be DataGenerator<number>
 * // with defer:
 * defer(withOverrides(struct({ num1: numberGenerator(), num2: numberGenerator() })), (dg) => dg.map(({ num1, num2 }) => num1 + num2));
 */
export const defer =
    <T, U, V extends any[]>(
        dataGeneratorFn: (...args: V) => DataGenerator<T>,
        deferredProject: (arg: DataGenerator<T>) => DataGenerator<U>
    ): ((...args: V) => DataGenerator<U>) =>
    (...args: V) =>
        deferredProject(dataGeneratorFn(...args));
