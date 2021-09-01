import { take } from "./take";

/**
 * Limits a generator to one output
 * 
 * @category Transformer
 * @returns A generator that emits a single output
 */
export function one<T>() {
    return function (gen: () => Iterable<T>) {
        return take(1)(gen);
    };
}
