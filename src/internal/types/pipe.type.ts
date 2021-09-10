/** @internal */
export type Transform<T> = T extends () => Iterable<infer U> ? U : never;

/** @internal */
export type PFst<T, U> = (arg: () => Iterable<T>) => U;

/** @internal */
export type UFn<T, U> = (arg: T) => U;
