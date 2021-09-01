import { createGenerator } from './data-generator';

/**
 * Creates an infinite generator
 *
 * @param gen A function that returns the next output
 * @returns an inifite generator
 */
export function infinite<T>(gen: () => T) {
    return createGenerator(function* () {
        while (true) {
            yield gen();
        }
    });
}
