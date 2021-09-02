import { DataGenerator } from '../interfaces/data-generator.interface';
import { createGenerator } from './data-generator';

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
): DataGenerator<T | U> => createGenerator(_either(generatorA, generatorB, probabilityA));

export const _either = <T, U>(genA: Iterable<T>, genB: Iterable<U>, probA: number = 50): (() => Iterable<T | U>) => {
    return function* () {
        while (true) {
            const bool = Math.round(Math.random() * 100) < probA;
            const { value, done } = (bool ? genA : genB)[Symbol.iterator]().next();
            if (done) {
                return;
            }
            yield value;
        }
    };
};
