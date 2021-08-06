import { DataGenerator } from './data-generator.interface';
import { booleanGenerator } from './primitives';

/**
 * Creates a generator that returns either one value or another.
 *
 * @param generatorA A generator to potentially create a value from
 * @param generatorB A generator to potentially create a value from
 * @param probabilityA The probability of generating a value from `generatorA`
 * @returns Either a value from `generatorA`, or a value from `generatorB`.
 */
export const either = <T, U>(generatorA: DataGenerator<T>, generatorB: DataGenerator<U>, probabilityA: number = 50): DataGenerator<T | U> =>
    booleanGenerator(probabilityA).flatMap<T | U>((bool) => (bool ? generatorA : generatorB));
