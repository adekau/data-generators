import { createGenerator } from './data-generator';
import { DataGenerator } from './data-generator.interface';
import { many } from './many';

/**
 * Creates a random number generator with optional bounds.
 *
 * @param min the minimum bound
 * @param max the maximum bound
 * @returns a random number bounded by `min` and `max`
 */
export const numberGenerator = (min: number = 0, max: number = 1): DataGenerator<number> => createGenerator(() => min + Math.random() * (max - min));

/**
 * Creates a random integer generator with optional bounds.
 *
 * @param min the minimum bound
 * @param max the maximum bound
 * @returns a random integer bounded by `min` and `max`
 */
export const integerGenerator = (min: number = 1, max: number = 100): DataGenerator<number> => numberGenerator(min, max).map((num) => Math.round(num));

/**
 * Creates a random string of ASCII characters between char codes 32 and 126.
 *
 * @param length the length of the string to generate
 * @returns A random string generator
 */
export const stringGenerator = (length: number = 10): DataGenerator<string> => many(charGenerator, length).map((chars) => chars.join(''));

/**
 * Creates a random ASCII character between char codes 32 and 126.
 */
export const charGenerator: DataGenerator<string> = integerGenerator(32, 126).map((code) => String.fromCharCode(code));

/**
 * Creates a random boolean generator with optional probability.
 *
 * @param probabilityTrue the probability (between 0 and 100) percent of returning true.
 * @returns A random weighted probability boolean.
 */
export const booleanGenerator = (probabilityTrue: number = 50): DataGenerator<boolean> => numberGenerator(0, 100).map((num) => num < probabilityTrue);
