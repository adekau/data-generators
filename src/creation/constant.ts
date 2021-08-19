import { createGenerator } from './data-generator';
import { DataGenerator } from '../data-generator.interface';

/**
 * Generator that always generates the same value
 *
 * @category Creation
 * @param value The value to always generate
 * @returns a generator that outputs the input
 */
export const constant = <T>(value: T): DataGenerator<T> => createGenerator(() => value);
