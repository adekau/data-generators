/** @internal */
export type Tail<T extends unknown[]> = T extends [unknown, ...infer Rest] ? Rest : [];

/** @internal */
export type Limiter = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

/** @internal */
export type Flat<T, Limit extends 1[] = Limiter> = {
    0: T extends Iterable<infer U> ? Flat<U, Tail<Limit>> : T;
    1: T;
}[Limit['length'] extends 0 ? 1 : 0];
