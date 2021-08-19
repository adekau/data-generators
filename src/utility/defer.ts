import { DataGenerator } from '../interfaces/data-generator.interface';

/**
 * Defer projections on a data generator returned by a function until after the function is called. Useful on a `struct` data generator wrapped in `withOverrides` to keep
 * the original overrides in tact when manipulating the struct passed to `withOverrides` using `map`, `flatMap`, etc.
 *
 * @category Utility
 * @param dataGeneratorFn a function that returns a data generator
 * @param deferredProject a projection function that manipulates the returned data generator from `dataGeneratorFn` after the the returned function is called
 * @returns a proxy function with the same arguments as `dataGeneratorFn` and sends the output of `dataGeneratorFn` through `deferredProject`.
 * @example
 * ```
 * // use case:
 * struct({
 *     num1: numberGenerator(),
 *     num2: numberGenerator()
 * })
 *     .map(({ num1, num2 }) => num1 + num2)
 *     .pipe(withOverrides()); // type error, map caused the input to withOverloads to be DataGenerator<number>
 * // with defer:
 * struct({
 *     num1: numberGenerator(),
 *     num2: numberGenerator()
 * }).pipe(
 *     withOverrides(),
 *     defer((dg) => dg.map(({ num1, num2 }) => num1 + num2))
 * );
 * ```
 */
export const defer =
    <T, U, V extends any[]>(deferredProject: (arg: DataGenerator<T>) => DataGenerator<U>) =>
    (dataGeneratorFn: (...args: V) => DataGenerator<T>) =>
    (...args: V) =>
        deferredProject(dataGeneratorFn(...args));
