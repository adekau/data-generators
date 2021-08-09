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
    ap: <U>(projectGenerator: DataGenerator<(output: T) => U>) => projectGenerator.map((fn) => fn(create())),
    pipe: (...fns: Array<(arg: any) => any>) => {
        const firstFn = fns.shift();
        if (!firstFn) {
            return createGenerator(create);
        }
        const firstInvocation = firstFn(createGenerator(create));
        return fns.reduce((prev, cur) => cur(prev), firstInvocation);
    }
});

export const dgMap =
    <T, U>(project: (output: T) => U) =>
    (dg: DataGenerator<T>) =>
        dg.map(project);

const gen = createGenerator(() => 5).pipe(
    dgMap((o) => o.toString()),
    dgMap((o) => o.concat('!')),
    dgMap((o) => o.length)
);
