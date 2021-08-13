import { DataGenerator } from './data-generator.interface';

/**
 * Pipeable version of {@link DataGenerator.ap}
 */
export const dgAp =
    <T, U>(projectGenerator: DataGenerator<(output: T) => U>) =>
    (dg: DataGenerator<T>) =>
        dg.ap(projectGenerator);

/**
 * Applies a generator on a struct
 *
 * @param name the name on the struct to bind to
 * @param dgT the generator to use for the value
 * @returns a data generator that generates the input value with `{ [name]: generatorOutput }` appended
 * @example
 * constant({ i: 100 }).pipe(
 *     apS('j', incrementGenerator(1))
 * ).createMany(2); // [{ i: 100, j: 1 }, { i: 100, j: 2 }]
 */
export const apS =
    <TName extends string, A extends object, T>(name: Exclude<TName, keyof A>, dgT: DataGenerator<T>) =>
    (dgA: DataGenerator<A>): DataGenerator<{ [K in keyof A | TName]: K extends keyof A ? A[K] : T }> => {
        return dgT.ap(dgA.map((a) => (t: T) => Object.assign({}, a, { [name]: t }) as any));
    };
