import { DataGenerator } from './data-generator.interface';

/**
 * Binds the generator output to a property on a new object with name `name`.
 *
 * @param name the object property name to bind to
 * @returns An object with the output of the called generator bound to property `name`.
 * @example
 * integerGenerator().pipe(bindTo('num')).create(); // { num: 57 }
 */
export const bindTo =
    <TName extends string, T>(name: TName) =>
    (generator: DataGenerator<T>): DataGenerator<{ [K in TName]: T }> =>
        generator.map((out) => ({ [name]: out } as { [K in TName]: T }));

/**
 * Like `apS`, but allows the generator to be dependent on previous struct values.
 *
 * @param name the object property name to bind to
 * @param f callback that gives access to previous generator output for use in creating a new generator
 * @returns a new object generator with the returned generator of `f` used to compute property `name`.
 * @example
 * integerGenerator(1, 10).pipe(
 *     bindTo('num'),
 *     bind('str', ({ num }) => stringGenerator(num))
 * ).createMany(2); // [{ num: 2, str: 'a!' }, { num: 7, str: '1_)Z/Mi' }]
 */
export const bind =
    <TName extends string, A extends object, T>(name: Exclude<TName, keyof A>, f: (a: A) => DataGenerator<T>) =>
    (dgA: DataGenerator<A>): DataGenerator<{ [K in keyof A | TName]: K extends keyof A ? A[K] : T }> => {
        return dgA.flatMap((a) => f(a).map((t) => Object.assign({}, a, { [name]: t }) as any));
    };
