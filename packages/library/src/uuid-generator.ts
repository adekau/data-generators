import { createGenerator } from 'semble-ts/core';
import { v4 } from 'uuid';

/**
 * Creates a generator that outputs a random UUID
 *
 * @category Library
 */
export const uuidGenerator = createGenerator(function* () {
    while (true) {
        yield v4();
    }
});
