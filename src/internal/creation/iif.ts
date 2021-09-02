import { createGenerator } from './data-generator';

/**
 * Picks and exhausts a generator chosen based on the input predicate.
 *
 * @category Creation
 * @param predicate Predicate to pick a generator based on
 * @param trueBranch Generator to use if the predicate is true
 * @param falseBranch Generator to use if the predicate is false
 * @returns A generator that picks and exhausts the generator based on the predicate
 */
export function iif<T, U>(predicate: () => boolean, trueBranch: Iterable<T>, falseBranch: Iterable<U>) {
    return createGenerator(function* () {
        if (predicate()) {
            yield* trueBranch;
        } else {
            yield* falseBranch;
        }
    });
}
