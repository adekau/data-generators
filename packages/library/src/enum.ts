import { DataGenerator, infinite } from 'semble-ts/core';

import { integerGenerator } from './primitives';

/**
 * Generates a valid entry of an input enumeration.
 *
 * @category Library
 * @param enumeration An enum. **Cannot be a `const enum`**.
 * @returns A random entry of the input enum
 * @example
 * ```
 * enum EyeColor {
 *     Green = 1,
 *     Blue = 'blue',
 *     Brown = 2
 * }
 * enumValueGenerator(EyeColor).createMany(5);
 * // [2, 'blue', 'blue', 2, 1]
 * ```
 */
export const enumValueGenerator = <T extends Record<any, unknown>>(enumeration: T): DataGenerator<T[keyof T]> =>
    infinite(() => {
        const enumKeys = Object.keys(enumeration);
        const enumLength = enumKeys.length;
        const randomIndex = integerGenerator(0, enumLength - 1).create();
        const randomKey = enumKeys[randomIndex];
        // in the event that a value is the same as a key, then it's a duplicate entry because of a numeric enum value
        // so find the actual key and use that instead
        const contains = enumKeys.indexOf(enumeration[randomKey] as any);
        if (contains !== -1) {
            return enumeration[enumKeys[contains]] as T[keyof T];
        } else {
            return enumeration[randomKey] as T[keyof T];
        }
    });
