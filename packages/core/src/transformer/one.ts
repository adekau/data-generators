import { pipe } from './pipe';
import { take } from './take';

/**
 * Limits a generator to one output
 *
 * @category Transformer
 * @returns A generator that emits a single output
 */
export function one<T>() {
    return function (gen: () => Iterable<T>) {
        return pipe(gen, take(1));
    };
}
