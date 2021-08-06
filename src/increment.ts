import { createGenerator } from './data-generator';
import { DataGenerator } from './data-generator.interface';

/**
 * Creates a generator that increments on each output from 0 by default, unless `startWith` is specified.
 *
 * @param startWith number to start incrementing from
 * @returns a generator that increments the output on each create
 */
export const incrementGenerator = (startWith: number = 0): DataGenerator<number> => createGenerator(() => startWith++);
