/**
 * Extracts the type argument from an Iterable function.
 *
 * @internal
 * @example
 * ```
 * type IterFn = () => Iterable<number>;
 * type IterFnTypeArg = IterableResult<IterFn>; // number
 * ```
 */
export type IterableResult<T> = T extends () => Iterable<infer U> ? U : never;

/**
 * First function argument of a pipe call.
 * Takes the initial iterable and transforms it into something else, that will then be taken by a `UFn` function if provided.
 *
 * @internal
 * @example
 * ```
 * const timesTwo: UFn<number, number> = (n) => n * 2;
 * const intital = () => [1, 2, 3];
 * const mapTimesTwo: PFst<number, () => Generator<number, void>> = map(timesTwo);
 *
 * const piped = pipe(initial, mapTimesTwo);
 * ```
 */
export type PFst<T, U> = (arg: () => Iterable<T>) => U;

/**
 * Unary function
 *
 * @internal
 * @example
 * ```
 * const timesTwo: UFn<number, number> = (n) => n * 2;
 * ```
 */
export type UFn<T, U> = (arg: T) => U;
