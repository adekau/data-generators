import { DataGenerator } from '../interfaces/data-generator.interface';
import { booleanGenerator } from '../library/primitives';
import { flatMap, flatMapShallow } from '../transformer';
import { one } from '../transformer/one';

/**
 * Creates a generator that returns either one value or another.
 *
 * @category Creation
 * @param generatorA A generator to potentially create a value from
 * @param generatorB A generator to potentially create a value from
 * @param probabilityA The probability of generating a value from `generatorA`
 * @returns Either a value from `generatorA`, or a value from `generatorB`.
 * @example
 * ```
 * either(integerGenerator(1, 5), charGenerator).createMany(4);
 * // [2, 5, 'c', 2] type: (number | string)[]
 * ```
 */
export const either = <T, U>(
    generatorA: Iterable<T>,
    generatorB: Iterable<U>,
    probabilityA: number = 50
): DataGenerator<T | U> =>
    booleanGenerator(probabilityA).pipe(
        flatMap((bool) => (console.log(bool), bool ? one()(() => generatorA)() : one()(() => generatorB)()))
    ) as DataGenerator<T | U>;
