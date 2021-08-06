import { constant } from './constant';
import { DataGenerator } from './data-generator.interface';
import { either } from './either';

/**
 * Creates a generator that modifies the input generator to have a chance of returning `undefined`.
 *
 * @param generator the base generator to generate a value from when not returning `undefined`
 * @param undefinedProbability the probability (between 0 and 100) of generating `undefined`
 * @returns either a value from `generator` or `undefined`.
 */
export const optional = <T>(generator: DataGenerator<T>, undefinedProbability: number = 15): DataGenerator<T | undefined> => either(constant(undefined), generator, undefinedProbability);
