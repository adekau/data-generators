import { DataGenerator } from '../data-generator.interface';
import { createGenerator } from './data-generator';

/**
 * Creates a sequence of generators that on each `create` call creates from the next generator.
 * This includes `createMany` where each output in the array uses the next generator.
 *
 * @category Creation
 * @param generators comma separated generators of type T
 * @returns A {@link DataGenerator} that with each `create` call creates from the next generator.
 * @example
 * ```
 * sequence(charGenerator, stringGenerator(4), constant('Bob')).createMany(3);
 * // ['r', '6wCg', 'Bob']
 * ```
 */
export const sequence = <T>(...generators: DataGenerator<T>[]): DataGenerator<T> =>
    createGenerator(function* () {
        for (const gen of generators) {
            yield gen.create();
        }
    });

/**
 * Creates a sequence converting each input argument to a constant generator.
 *
 * @category Creation
 * @see {@link sequence}
 * @example
 * ```
 * struct({
 *     name: constantSequence('Tim', 'Bob', 'Alan')
 * }).createMany(3);
 * // [{ name: 'Tim' }, { name: 'Bob' }, { name: 'Alan' }]
 * ```
 */
export const constantSequence = <T>(...constants: T[]): DataGenerator<T> => createGenerator(() => [...constants]);
