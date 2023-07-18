import { Flat } from './flat.type';
import { IterableResult, PFst, UFn } from './pipe.type';
import { WithoutT } from './transformer/with';

export type BindArgs<T, U, TName extends string> = T extends unknown[]
    ? [(f: T) => Iterable<U>]
    : T extends Record<any, any>
    ? [name: Exclude<TName, keyof T>, f: (a: T) => Iterable<U>]
    : never;

export type BindReturn<T, U, TName extends string> = T extends unknown[]
    ? DataGenerator<[...T, U]>
    : T extends Record<any, any>
    ? DataGenerator<{ [K in keyof T | TName]: K extends keyof T ? T[K] : U }>
    : never;

export type ApplyArgs<T, U, TName extends string> = T extends unknown[]
    ? [gen: Iterable<U>]
    : T extends Record<any, any>
    ? [name: Exclude<TName, keyof T>, gen: Iterable<U>]
    : never;

export type ApplyReturn<T, U, TName extends string> = BindReturn<T, U, TName>;

export interface DataGenerator<T> extends Iterable<T> {
    /** @internal */
    readonly brand: unique symbol;
    /**
     * @internal
     *
     * If the data generator produces a struct or a tuple.
     */
    readonly type?: 'struct' | 'tuple';
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
     * @category Transformer
     * @param n the number of outputs to allow
     * @returns a new data generator that can only output `n` value(s)
     */
    take(n: number): DataGenerator<T>;

    /**
     * Provides the ability to pipeline [[`transformer`]]s together.
     *
     * @category Transformer
     * @param fns the functions to pipe together using the calling DataGenerator as the initial input
     * @return the result of piping the DataGenerator through all the pipeline functions
     */
    pipe<T1>(fn1: PFst<T, T1>): DataGenerator<IterableResult<T1>>;
    pipe<T1, T2>(fn1: PFst<T, T1>, fn2: UFn<T1, T2>): DataGenerator<IterableResult<T2>>;
    pipe<T1, T2, T3>(fn1: PFst<T, T1>, fn2: UFn<T1, T2>, fn3: UFn<T2, T3>): DataGenerator<IterableResult<T3>>;
    pipe<T1, T2, T3, T4>(
        fn1: PFst<T, T1>,
        fn2: UFn<T1, T2>,
        fn3: UFn<T2, T3>,
        fn4: UFn<T3, T4>
    ): DataGenerator<IterableResult<T4>>;
    pipe<T1, T2, T3, T4, T5>(
        fn1: PFst<T, T1>,
        fn2: UFn<T1, T2>,
        fn3: UFn<T2, T3>,
        fn4: UFn<T3, T4>,
        fn5: UFn<T4, T5>
    ): DataGenerator<IterableResult<T5>>;
    pipe<T1, T2, T3, T4, T5, T6>(
        fn1: PFst<T, T1>,
        fn2: UFn<T1, T2>,
        fn3: UFn<T2, T3>,
        fn4: UFn<T3, T4>,
        fn5: UFn<T4, T5>,
        fn6: UFn<T5, T6>
    ): DataGenerator<IterableResult<T6>>;
    pipe<T1, T2, T3, T4, T5, T6, T7>(
        fn1: PFst<T, T1>,
        fn2: UFn<T1, T2>,
        fn3: UFn<T2, T3>,
        fn4: UFn<T3, T4>,
        fn5: UFn<T4, T5>,
        fn6: UFn<T5, T6>,
        fn7: UFn<T6, T7>
    ): DataGenerator<IterableResult<T7>>;
    pipe<T1, T2, T3, T4, T5, T6, T7, T8>(
        fn1: PFst<T, T1>,
        fn2: UFn<T1, T2>,
        fn3: UFn<T2, T3>,
        fn4: UFn<T3, T4>,
        fn5: UFn<T4, T5>,
        fn6: UFn<T5, T6>,
        fn7: UFn<T6, T7>,
        fn8: UFn<T7, T8>
    ): DataGenerator<IterableResult<T8>>;
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
    ): DataGenerator<IterableResult<T9>>;
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
    ): DataGenerator<IterableResult<T10>>;
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
    ): DataGenerator<IterableResult<T11>>;
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
    ): DataGenerator<IterableResult<T12>>;

    /**
     * Uses {@link transformer.withS} on structs and {@link transformer.withT} on tuples.
     * Cannot be used on non-struct and non-tuple (i.e. primitive) values.
     */
    with<U extends keyof T>(name: U, using: Iterable<T[U]>): DataGenerator<T>;

    /**
     * Uses {@link transformer.withoutS} on structs and {@link transformer.withoutT} on tuples.
     * Cannot be used on non-struct and non-tuple (i.e. primitive) values.
     */
    without: T extends unknown[]
        ? <TIndex extends number>(index: TIndex) => DataGenerator<WithoutT<TIndex, T>>
        : T extends Record<any, any>
        ? <TName extends keyof T>(name: TName) => DataGenerator<{ [K in keyof T as K extends TName ? never : K]: T[K] }>
        : never;

    /**
     * Uses {@link transformer.bindS} on structs and {@link transformer.bindT} on tuples.
     * Cannot be used on non-struct and non-tuple (i.e. primitive) values.
     */
    bind<U, TName extends string>(...args: BindArgs<T, U, TName>): BindReturn<T, U, TName>;

    /**
     * Uses {@link transformer.bindToS} to bind the caller DataGenerator to a struct.
     */
    bindToStruct<TName extends string>(name: TName): DataGenerator<{ [K in TName]: T }>;

    /**
     * Uses {@link transformer.bindToT} to bind the caller DataGenerator to a tuple.
     */
    bindToTuple(): DataGenerator<[T]>;

    /**
     * Uses {@link transformer.apS} on structs and {@link transformer.apT} on tuples.
     * Cannot be used on non-struct and non-tuple (i.e. primitive) values.
     */
    apply<U, TName extends string>(...args: ApplyArgs<T, U, TName>): ApplyReturn<T, U, TName>;

    /**
     * Uses {@link transformer.withDefault} to use a data generator in place of undefined values.
     */
    withDefault(defaultGenerator: Iterable<T>): DataGenerator<Exclude<T, undefined>>;

    /**
     * Uses {@link transformer.optional} on the caller DataGenerator to include a probability of creating an undefined value.
     */
    optional(undefinedProbability?: number): DataGenerator<T | undefined>;

    /**
     * Uses {@link tansformer.many} on the caller DataGenerator to create an array of length `length` from the generator.
     */
    many(length: number): DataGenerator<T[]>;

    /**
     * Uses {@link transformer.flat} to flatten nested iterators into a single iterator.
     * For non-flattenable iterators (iterators that contain no nested iterables), this function is a no-op.
     */
    flat(): DataGenerator<Flat<Iterable<T>>>;
}
