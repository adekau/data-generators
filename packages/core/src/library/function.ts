import { DataGenerator } from '../data-generator.interface';
import { map } from '../transformer/map';
import { pipe } from '../transformer/pipe';

/**
 * Creates a DataGenerator that generates functions for mock callbacks.
 *
 * @category Library
 * @param returnValueGenerator The DataGenerator to use to generate the return value of the created function
 * @returns a new DataGenerator that generates functions that return a value from the `returnValueGenerator`
 */
export const functionGenerator = <T>(returnValueGenerator: DataGenerator<T>): DataGenerator<() => T> =>
    returnValueGenerator.map((out) => () => out);

/**
 * Pipe operator to convert a DataGenerator to a DataGenerator that generates a function returning the piped generator's output
 *
 * @category Transformer
 * @returns a {@link functionGenerator}
 */
export const toFunctionGenerator =
    <T>() =>
    (dg: () => Iterable<T>): (() => Iterable<() => T>) => {
        return pipe(
            dg,
            map((t) => () => t)
        );
    };
