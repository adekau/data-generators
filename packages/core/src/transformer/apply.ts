import { _struct } from '../creation/struct';
import { _tuple } from '../creation/tuple';
import { map } from './map';
import { pipe } from './pipe';

/**
 * Pipeable version of {@link DataGenerator.ap}
 *
 * @category Transformer
 */
export function ap<T, U>(projectGenerator: Iterable<(v: T) => U>) {
    return function (gen: () => Iterable<T>) {
        return function* () {
            for (const fn of projectGenerator) {
                for (const x of gen()) {
                    yield fn(x);
                }
            }
        };
    };
}

/**
 * Applies a generator on a struct
 *
 * @category Transformer
 * @param name the name on the struct to bind to
 * @param dgT the generator to use for the value
 * @returns a data generator that generates the input value with `{ [name]: generatorOutput }` appended
 * @example
 * ```
 * constant({ i: 100 }).pipe(
 *     apS('j', incrementGenerator(1))
 * ).createMany(2);
 * // [{ i: 100, j: 1 }, { i: 100, j: 2 }]
 * ```
 */
export const apS =
    <TName extends string, A extends object, T>(name: Exclude<TName, keyof A>, dgT: Iterable<T>) =>
    (dgA: () => Iterable<A>): (() => Iterable<{ [K in keyof A | TName]: K extends keyof A ? A[K] : T }>) => {
        return pipe(
            _struct({ out: dgA(), append: dgT }),
            map(
                ({ out, append }) =>
                    Object.assign({}, out, { [name]: append }) as {
                        [K in keyof A | TName]: K extends keyof A ? A[K] : T;
                    }
            )
        );
    };

/**
 * Applies a generator on a tuple.
 *
 * @category Transformer
 * @param dgT the generator to use for the value
 * @returns a tuple generator that appends the output `dgT` to the end of a tuple
 * @example
 * ```
 * constant([]).pipe(
 *     apT(integerGenerator())
 * ).create();
 * // [33]
 * ```
 */
export const apT =
    <T, A extends unknown[]>(dgT: Iterable<T>) =>
    (dgA: () => Iterable<A>): (() => Iterable<[...A, T]>) => {
        return pipe(
            _tuple(dgA(), dgT),
            map(([a, t]) => [...a, t])
        );
    };
