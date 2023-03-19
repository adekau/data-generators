import { DataGenerator } from 'semble-ts/interfaces';

/** @internal */
export type Inner<T extends readonly Iterable<unknown>[]> = T[number] extends DataGenerator<infer U> ? U : never;
