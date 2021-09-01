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
    /**
     * Generate a single output
     *
     * @category Extraction
     * @returns a single value of type `T`.
     * @example
     * ```
     * charGenerator.create();
     * // 'T'
     * ```
     */
    create(): T;

    /**
     * Generate an array of input length of outputs
     *
     * @category Extraction
     * @param length the number of outputs to generate
     * @returns an array of length `length` of generated outputs
     * @example
     * ```
     * integerGenerator(1, 10).createMany(4);
     * // [3, 1, 9, 3]
     * ```
     */
    createMany(n: number): T[];

    /**
     * Generate an array of all outputs of the generator.
     *
     * @category Extraction
     * @returns an array of the outputs of the exhausted data generator
     * @example
     * ```
     * integerGenerator(1, 10).pipe(take(4)).createAll();
     * // [4, 10, 2, 7]
     * ```
     */
    createAll(): T[];

    /**
     * @category Transformer
     * @param project mapping function from a single output of {@link DataGenerator.create}
     * to a new value.
     * @returns a new {@link DataGenerator} that uses the projection function to generate output.
     * @example
     * ```
     * const gen = integerGenerator(1, 10).map((n: number) => n * 10);
     * gen.create();
     * // returns a number between 10 and 100
     * ```
     */
    map<U>(project: (t: T) => U): DataGenerator<U>;

    /**
     * @category Transformer
     * @param project mapping function from single output of {@link DataGenerator.create} to
     * a new {@link DataGenerator}.
     * @returns a new data generator created by `project`.
     * @example
     * ```
     * const randomProbabilityGenerator = numberGenerator(0, 100);
     * const gen = randomProbabilityGenerator.flatMap(booleanGenerator);
     * gen.create();
     * // generates a boolean with a random probability of being true
     * ```
     */
    flatMap<U>(project: (t: T) => Iterable<U>): DataGenerator<Flat<U>>;

    /**
     * @category Transformer
     * @param projectGenerator a data generator that generates the mapping function
     * @returns a new data generator that applies the projection generator to the calling generator
     * @example
     * ```
     * const mapper = createGenerator(() => (n: number) => n * 10);
     * const gen = integerGenerator(1, 10).ap(mapper);
     * gen.create();
     * // returns a number between 10 and 100
     * ```
     */
    ap<U>(projectGenerator: Iterable<(t: T) => U>): DataGenerator<U>;

    /**
     * @category Transformer
     * @returns a new data generator that can only output one value
     */
    one(): DataGenerator<T>;

    /**
     * @category Tranformer
     * @param n the number of outputs to allow
     * @returns a new data generator that can only output `n` value(s)
     */
    take(n: number): DataGenerator<T>;

    /**
     * Provides the ability to pipeline functions together.
     *
     * @category Transformer
     * @param fns the functions to pipe together using the calling DataGenerator as the initial input
     * @return the result of piping the DataGenerator through all the pipeline functions
     */
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
    pipe<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
        fn1: PFst<T, T1>,
        fn2: UFn<T1, T2>,
        fn3: UFn<T2, T3>,
        fn4: UFn<T3, T4>,
        fn5: UFn<T4, T5>,
        fn6: UFn<T5, T6>,
        fn7: UFn<T6, T7>,
        fn8: UFn<T7, T8>,
        fn9: UFn<T8, T9>,
        fn10: UFn<T9, T10>
    ): DataGenerator<Transform<T10>>;
    pipe<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11>(
        fn1: PFst<T, T1>,
        fn2: UFn<T1, T2>,
        fn3: UFn<T2, T3>,
        fn4: UFn<T3, T4>,
        fn5: UFn<T4, T5>,
        fn6: UFn<T5, T6>,
        fn7: UFn<T6, T7>,
        fn8: UFn<T7, T8>,
        fn9: UFn<T8, T9>,
        fn10: UFn<T9, T10>,
        fn11: UFn<T10, T11>
    ): DataGenerator<Transform<T11>>;
    pipe<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12>(
        fn1: PFst<T, T1>,
        fn2: UFn<T1, T2>,
        fn3: UFn<T2, T3>,
        fn4: UFn<T3, T4>,
        fn5: UFn<T4, T5>,
        fn6: UFn<T5, T6>,
        fn7: UFn<T6, T7>,
        fn8: UFn<T7, T8>,
        fn9: UFn<T8, T9>,
        fn10: UFn<T9, T10>,
        fn11: UFn<T10, T11>,
        fn12: UFn<T11, T12>
    ): DataGenerator<Transform<T12>>;
}
