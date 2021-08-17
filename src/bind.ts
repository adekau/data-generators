import { DataGenerator } from './data-generator.interface';

/**
 * Binds the generator output to a property on a new object with name `name`.
 *
 * @param name the object property name to bind to
 * @returns An object with the output of the called generator bound to property `name`.
 * @example
 * ```
 * integerGenerator().pipe(bindToS('num')).create(); // { num: 57 }
 * ```
 */
export const bindToS =
    <TName extends string, T>(name: TName) =>
    (generator: DataGenerator<T>): DataGenerator<{ [K in TName]: T }> =>
        generator.map((out) => ({ [name]: out } as { [K in TName]: T }));

/**
 * Binds the generator output to the first member of a new tuple.
 *
 * @returns a single element tuple generator
 * @example
 * ```
 * integerGenerator().pipe(bindToT()).create(); // [52]
 * ```
 */
export const bindToT =
    <T>() =>
    (generator: DataGenerator<T>): DataGenerator<[T]> =>
        generator.map((out) => [out]);

/**
 * Like `apS`, but allows the generator to be dependent on previous struct values.
 *
 * @param name the object property name to bind to
 * @param f callback that gives access to previous generator output for use in creating a new generator
 * @returns a new object generator with the returned generator of `f` used to compute property `name`.
 * @example
 * ```
 * integerGenerator(1, 10).pipe(
 *     bindToS('num'),
 *     bindS('str', ({ num }) => stringGenerator(num))
 * ).createMany(2); // [{ num: 2, str: 'a!' }, { num: 7, str: '1_)Z/Mi' }]
 * ```
 */
export const bindS =
    <TName extends string, A extends object, T>(name: Exclude<TName, keyof A>, f: (a: A) => DataGenerator<T>) =>
    (dgA: DataGenerator<A>): DataGenerator<{ [K in keyof A | TName]: K extends keyof A ? A[K] : T }> => {
        return dgA.flatMap((a) => f(a).map((t) => Object.assign({}, a, { [name]: t }) as any));
    };

/**
 * Like `apT`, but allows the generator to be dependent on other tuple values.
 * 
 * @param f callback that gives access to previous generator output in the tuple for use in creating a new generator
 * @returns a new tuple generator with the returned generator of `f` being used to compute the next member of the tuple.
 * @example
 * ```
 * integerGenerator(1, 10).pipe(
 *     bindToT(),
 *     bindT(([i]) => stringGenerator(i))
 * ).create(); // [4, 'hTyt']
 * ```
 */
export const bindT =
    <A extends unknown[], T>(f: (a: A) => DataGenerator<T>) =>
    (dgA: DataGenerator<A>): DataGenerator<[...A, T]> => {
        return dgA.flatMap((a) => f(a).map((t) => [...a, t]));
    };
