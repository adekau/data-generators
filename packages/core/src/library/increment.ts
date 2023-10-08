import { createGenerator } from '../creation/data-generator';

/**
 * Creates a generator that increments on each output from 0 by default, unless `startWith` is specified.
 *
 * @category Library
 * @param startWith number to start incrementing from
 * @returns a generator that increments the output on each create
 * @example
 * ```
 * incrementGenerator(5).createMany(6);
 * // [5, 6, 7, 8, 9, 10]
 * ```
 */
export const incrementGenerator = (startWith: number = 0, persist: boolean = false) =>
    createGenerator(function* () {
        let i = startWith;
        while (true) {
            if (persist) {
                yield startWith++;
            } else {
                yield i++;
            }
        }
    });
