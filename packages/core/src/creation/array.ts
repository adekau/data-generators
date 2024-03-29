import { DataGenerator } from '../data-generator.interface';
import { many } from '../transformer/many';

/**
 * A generator that takes a base generator and generates arrays of the base type.
 *
 * @param baseGenerator generator for the type of array, for example `string[]` would use `[[string]]()` as the base.
 * @param minValues minimum bound of the random number of array members to create (default 1)
 * @param maxValues maxmimum bound of the number of array members to create (default 50)
 * @returns
 */
export function arrayGenerator<T>(
    baseGenerator: DataGenerator<T>,
    minValues: number = 1,
    maxValues: number = 50
): DataGenerator<T[]> {
    return baseGenerator.pipe(many(minValues + Math.random() * (maxValues - minValues)));
}
