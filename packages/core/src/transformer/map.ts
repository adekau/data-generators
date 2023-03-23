import { flat } from './flat';
import { pipe } from './pipe';

/**
 * Pipeable version of {@link DataGenerator.map}.
 *
 * @category Transformer
 */
export function map<T, U>(project: (t: T) => U) {
    return function (gen: () => Iterable<T>) {
        return function* () {
            for (const x of gen()) {
                yield project(x);
            }
        };
    };
}

/**
 * Pipeable version of {@link DataGenerator.flatMap}
 *
 * @category Transformer
 */
export function flatMap<T, U>(project: (v: T) => Iterable<U>) {
    return function (gen: () => Iterable<T>) {
        return pipe(gen, map(project), flat());
    };
}

/**
 * A shallow version of {@link flatMap}, only flattens one level.
 *
 * @category Transformer
 */
export function flatMapShallow<T, U>(project: (v: T) => Iterable<U>) {
    return function (gen: () => Iterable<T>) {
        return function* () {
            for (const x of gen()) {
                yield* project(x);
            }
        };
    };
}
