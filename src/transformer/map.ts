import { DataGenerator } from '../interfaces/data-generator.interface';
import { flat } from './flat';

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
        return flat<Iterable<Iterable<U>>>()(map(project)(gen));
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
