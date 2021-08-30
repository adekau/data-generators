type Transform<T> = T extends () => Iterable<infer U> ? U : never;
type PFst<T, U> = (arg: () => Iterable<T>) => U;
type UFn<T, U> = (arg: T) => U;

export type Tail<T extends unknown[]> = T extends [unknown, ...infer Rest] ? Rest : [];
export type Limiter = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
export type Flat<T, Limit extends 1[] = Limiter> = {
    0: T extends Iterable<infer U> ? Flat<U, Tail<Limit>> : T;
    1: T;
}[Limit['length'] extends 0 ? 1 : 0];

export interface DataGenerator<T> extends Iterable<T> {
    create(): T;
    createMany(n: number): T[];
    createAll(): T[];
    map<U>(project: (t: T) => U): DataGenerator<U>;
    flatMap<U>(project: (t: T) => Iterable<U>): DataGenerator<Flat<U>>;
    ap<U>(projectGenerator: Iterable<(t: T) => U>): DataGenerator<U>;
    one(): DataGenerator<T>;

    pipe<T1>(fn1: PFst<T, T1>): DataGenerator<Transform<T1>>;
    pipe<T1, T2>(fn1: PFst<T, T1>, fn2: UFn<T1, T2>): DataGenerator<Transform<T2>>;
    pipe<T1, T2, T3>(fn1: PFst<T, T1>, fn2: UFn<T1, T2>, fn3: UFn<T2, T3>): DataGenerator<Transform<T3>>;
    pipe<T1, T2, T3, T4>(
        fn1: PFst<T, T1>,
        fn2: UFn<T1, T2>,
        fn3: UFn<T2, T3>,
        fn4: UFn<T3, T4>
    ): DataGenerator<Transform<T4>>;
    pipe<T1, T2, T3, T4, T5>(
        fn1: PFst<T, T1>,
        fn2: UFn<T1, T2>,
        fn3: UFn<T2, T3>,
        fn4: UFn<T3, T4>,
        fn5: UFn<T4, T5>
    ): DataGenerator<Transform<T5>>;
    pipe<T1, T2, T3, T4, T5, T6>(
        fn1: PFst<T, T1>,
        fn2: UFn<T1, T2>,
        fn3: UFn<T2, T3>,
        fn4: UFn<T3, T4>,
        fn5: UFn<T4, T5>,
        fn6: UFn<T5, T6>
    ): DataGenerator<Transform<T6>>;
    pipe<T1, T2, T3, T4, T5, T6, T7>(
        fn1: PFst<T, T1>,
        fn2: UFn<T1, T2>,
        fn3: UFn<T2, T3>,
        fn4: UFn<T3, T4>,
        fn5: UFn<T4, T5>,
        fn6: UFn<T5, T6>,
        fn7: UFn<T6, T7>
    ): DataGenerator<Transform<T7>>;
    pipe<T1, T2, T3, T4, T5, T6, T7, T8>(
        fn1: PFst<T, T1>,
        fn2: UFn<T1, T2>,
        fn3: UFn<T2, T3>,
        fn4: UFn<T3, T4>,
        fn5: UFn<T4, T5>,
        fn6: UFn<T5, T6>,
        fn7: UFn<T6, T7>,
        fn8: UFn<T7, T8>
    ): DataGenerator<Transform<T8>>;
    pipe<T1, T2, T3, T4, T5, T6, T7, T8, T9>(
        fn1: PFst<T, T1>,
        fn2: UFn<T1, T2>,
        fn3: UFn<T2, T3>,
        fn4: UFn<T3, T4>,
        fn5: UFn<T4, T5>,
        fn6: UFn<T5, T6>,
        fn7: UFn<T6, T7>,
        fn8: UFn<T7, T8>,
        fn9: UFn<T8, T9>
    ): DataGenerator<Transform<T9>>;
}

// type UnaryFunction<I, R> = (arg: I) => R;
// type DataGeneratorFunction<T, R> = (arg: DataGenerator<T>) => R;
// /**
//  * Interface for a factory that generates random test data
//  */
// export interface DataGenerator<T> {
//     (): Iterable<T>;
//     /**
//      * Generate a single output
//      *
//      * @category Extraction
//      * @returns a single value of type `T`.
//      * @example
//      * ```
//      * charGenerator.create(); // 'T'
//      * ```
//      */
//     create(): T;

//     /**
//      * Generate an array of input length of outputs
//      *
//      * @category Extraction
//      * @param length the number of outputs to generate
//      * @returns an array of length `length` of generated outputs
//      * @example
//      * ```
//      * integerGenerator(1, 10).createMany(4); // [3, 1, 9, 3]
//      * ```
//      */
//     createMany(length: number): T[];

//     /**
//      * @category Transformer
//      * @param project mapping function from a single output of {@link DataGenerator.create}
//      * to a new value.
//      * @returns a new {@link DataGenerator} that uses the projection function to generate output.
//      * @example
//      * ```
//      * const gen = integerGenerator(1, 10).map((n: number) => n * 10);
//      * gen.create(); // returns a number between 10 and 100
//      * ```

//      */
//     map<U>(project: (output: T) => U): DataGenerator<U>;

//     /**
//      * @category Transformer
//      * @param project mapping function from single output of {@link DataGenerator.create} to
//      * a new {@link DataGenerator}.
//      * @returns a new data generator created by `project`.
//      * @example
//      * ```
//      * const randomProbabilityGenerator = numberGenerator(0, 100);
//      * const gen = randomProbabilityGenerator.flatMap(booleanGenerator);
//      * gen.create(); // generates a boolean with a random probability of being true
//      * ```
//      */
//     flatMap<U>(project: (output: T) => DataGenerator<U>): DataGenerator<U>;

//     /**
//      * @category Transformer
//      * @param projectGenerator a data generator that generates the mapping function
//      * @returns a new data generator that applies the projection generator to the calling generator
//      * @example
//      * ```
//      * const mapper = createGenerator(() => (n: number) => n * 10);
//      * const gen = integerGenerator(1, 10).ap(mapper);
//      * gen.create(); // returns a number between 10 and 100
//      * ```
//      */
//     ap<U>(projectGenerator: Iterable<(output: T) => U>): DataGenerator<U>;

//     /**
//      * Provides the ability to pipeline functions together.
//      *
//      * @category Transformer
//      * @param fns the functions to pipe together using the calling DataGenerator as the initial input
//      * @return the result of piping the DataGenerator through all the pipeline functions
//      */
//     pipe(): DataGenerator<T>;
//     pipe<T1>(fn: DataGeneratorFunction<T, T1>): T1;
//     pipe<T1, T2>(fn: DataGeneratorFunction<T, T1>, fn1: UnaryFunction<T1, T2>): T2;
//     pipe<T1, T2, T3>(fn: DataGeneratorFunction<T, T1>, fn1: UnaryFunction<T1, T2>, fn2: UnaryFunction<T2, T3>): T3;
//     pipe<T1, T2, T3, T4>(
//         fn: DataGeneratorFunction<T, T1>,
//         fn1: UnaryFunction<T1, T2>,
//         fn2: UnaryFunction<T2, T3>,
//         fn3: UnaryFunction<T3, T4>
//     ): T4;
//     pipe<T1, T2, T3, T4, T5>(
//         fn: DataGeneratorFunction<T, T1>,
//         fn1: UnaryFunction<T1, T2>,
//         fn2: UnaryFunction<T2, T3>,
//         fn3: UnaryFunction<T3, T4>,
//         fn4: UnaryFunction<T4, T5>
//     ): T5;
//     pipe<T1, T2, T3, T4, T5, T6>(
//         fn: DataGeneratorFunction<T, T1>,
//         fn1: UnaryFunction<T1, T2>,
//         fn2: UnaryFunction<T2, T3>,
//         fn3: UnaryFunction<T3, T4>,
//         fn4: UnaryFunction<T4, T5>,
//         fn5: UnaryFunction<T5, T6>
//     ): T6;
//     pipe<T1, T2, T3, T4, T5, T6, T7>(
//         fn: DataGeneratorFunction<T, T1>,
//         fn1: UnaryFunction<T1, T2>,
//         fn2: UnaryFunction<T2, T3>,
//         fn3: UnaryFunction<T3, T4>,
//         fn4: UnaryFunction<T4, T5>,
//         fn5: UnaryFunction<T5, T6>,
//         fn6: UnaryFunction<T6, T7>
//     ): T7;
//     pipe<T1, T2, T3, T4, T5, T6, T7, T8>(
//         fn: DataGeneratorFunction<T, T1>,
//         fn1: UnaryFunction<T1, T2>,
//         fn2: UnaryFunction<T2, T3>,
//         fn3: UnaryFunction<T3, T4>,
//         fn4: UnaryFunction<T4, T5>,
//         fn5: UnaryFunction<T5, T6>,
//         fn6: UnaryFunction<T6, T7>,
//         fn7: UnaryFunction<T7, T8>
//     ): T8;
//     pipe<T1, T2, T3, T4, T5, T6, T7, T8, T9>(
//         fn: DataGeneratorFunction<T, T1>,
//         fn1: UnaryFunction<T1, T2>,
//         fn2: UnaryFunction<T2, T3>,
//         fn3: UnaryFunction<T3, T4>,
//         fn4: UnaryFunction<T4, T5>,
//         fn5: UnaryFunction<T5, T6>,
//         fn6: UnaryFunction<T6, T7>,
//         fn7: UnaryFunction<T7, T8>,
//         fn8: UnaryFunction<T8, T9>
//     ): T9;
// }
