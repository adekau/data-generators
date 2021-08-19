import { createGenerator } from '../creation/data-generator';
import { DataGenerator } from '../interfaces/data-generator.interface';
import { many } from '../transformer/many';

/**
 * Creates a random number generator with optional bounds.
 *
 * @category Library
 * @param min the minimum bound (default 0)
 * @param max the maximum bound (default 1)
 * @returns a random number bounded by `min` and `max`
 */
export const numberGenerator = (min: number = 0, max: number = 1): DataGenerator<number> =>
    createGenerator(() => min + Math.random() * (max - min));

/**
 * Creates a random integer generator with optional bounds.
 *
 * @category Library
 * @param min the minimum bound (default 1)
 * @param max the maximum bound (default 100)
 * @returns a random integer bounded by `min` and `max`
 */
export const integerGenerator = (min: number = 1, max: number = 100): DataGenerator<number> =>
    numberGenerator(min, max).map((num) => Math.round(num));

/**
 * Creates a random string of ASCII characters between char codes 32 and 126.
 *
 * @category Library
 * @param length the length of the string to generate (default 10)
 * @returns A random string generator
 */
export const stringGenerator = (length: number = 10): DataGenerator<string> =>
    charGenerator.pipe(many(length)).map((chars) => chars.join(''));

/**
 * Creates a random ASCII character between char codes 32 and 126.
 *
 * @category Library
 */
export const charGenerator: DataGenerator<string> = integerGenerator(32, 126).map((code) => String.fromCharCode(code));

/**
 * Creates a random boolean generator with optional probability.
 *
 * @category Library
 * @param probabilityTrue the probability (between 0 and 100) percent of returning true. (default 50)
 * @returns A random weighted probability boolean.
 */
export const booleanGenerator = (probabilityTrue: number = 50): DataGenerator<boolean> =>
    numberGenerator(0, 100).map((num) => num < probabilityTrue);
