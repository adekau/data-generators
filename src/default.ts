import { constant } from './constant';
import { DataGenerator } from './data-generator.interface';

/**
 * Data Generator pipe operator for using a default generator in place of undefined outputs.
 * 
 * @param defaultGenerator default generator to use when undefined is outputted
 */
export const withDefault =
    <T>(defaultGenerator: DataGenerator<T>) =>
	/**
	 * @param dg Data Generator for which to use a default generator in place of undefined values
	 * @returns a new generator, replacing undefined with a value from the default generator
	 */
    (dg: DataGenerator<T | undefined>) =>
        dg.flatMap((out) => (out ? constant(out) : defaultGenerator));
