import { DataGenerator } from "./data-generator.interface";

/** @internal */
export type Inner<T extends readonly Iterable<unknown>[]> = T[number] extends DataGenerator<infer U> ? U : never;
