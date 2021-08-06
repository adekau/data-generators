import { constant } from './constant';
import { createGenerator } from './data-generator';
import { DataGenerator } from './data-generator.interface';

/**
 * Creates a sequence of generators that on each `create` call creates from the next generator.
 * This includes `createMany` where each output in the array uses the next generator.
 *
 * @param generators comma separated generators of type T
 * @returns A {@link DataGenerator} that with each `create` call creates from the next generator.
 */
export const sequence = <T>(...generators: DataGenerator<T>[]): DataGenerator<T | undefined> => createGenerator(() => generators.shift()).flatMap((gen) => (gen ? gen : constant(undefined)));

/**
 * Creates a sequence converting each input argument to a constant generator.
 *
 * @see {@link sequence}
 */
export const constantSequence = <T>(...constants: T[]): DataGenerator<T | undefined> => createGenerator(() => constants.shift()).flatMap(constant);
