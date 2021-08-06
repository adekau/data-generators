import { DataGenerator } from './data-generator.interface';

/**
 * Creates a Data Generator adhering to the interface, and automatically generates
 * the `createMany`, `map`, and `flatMap` functions using the `create` input provided.
 *
 * @param create The function that generates data.
 * @returns a {@link DataGenerator} of type T
 */
export const createGenerator = <T>(create: () => T): DataGenerator<T> => ({
    create,
    createMany: (length: number) => Array.from({ length }).map(create),
    map: <U>(project: (output: T) => U) => createGenerator(() => project(create())),
    flatMap: <U>(project: (output: T) => DataGenerator<U>) => createGenerator(() => project(create()).create()),
    ap: <U>(projectGenerator: DataGenerator<(output: T) => U>) => projectGenerator.map((fn) => fn(create()))
});
