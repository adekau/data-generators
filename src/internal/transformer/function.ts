import { map } from './map';
import { pipe } from './pipe';

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
