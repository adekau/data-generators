import { constant } from '../creation/constant';
import { DataGenerator } from 'semble-ts/interfaces';
import { either, _either } from '../creation/either';

/**
 * Creates a generator that modifies the input generator to have a chance of returning `undefined`.
 *
 * @category Transformer
 * @param generator the base generator to generate a value from when not returning `undefined`
 * @param undefinedProbability the probability (between 0 and 100) of generating `undefined` (default 15)
 * @returns either a value from `generator` or `undefined`.
 * @example
 * ```
 * // Can be used either as a pipe operator or standalone
 * // Pipe Operator:
 * integerGenerator().pipe(optional()); // type: DataGenerator<number | undefined>
 * // Standalone
 * optional(integerGenerator()); // type: DataGenerator<number | undefined>
 * ```
 */
export function optional<T>(
    undefinedProbability?: number
): (generator: () => Iterable<T>) => () => Iterable<T | undefined>;
export function optional<T>(generator: DataGenerator<T>, undefinedProbability?: number): DataGenerator<T | undefined>;
export function optional(...args: any[]): any {
    if (args.length === 0) {
        return (generator: () => Iterable<any>) => () => _either([undefined], generator(), 15)();
    }
    if (args.length === 1 && (typeof args[0] === 'number' || typeof args[0] === 'undefined')) {
        return (generator: () => Iterable<any>) => () => _either(constant(undefined), generator(), args[0] ?? 15)();
    }
    return either(constant(undefined), args[0], args[1] ?? 15);
}
