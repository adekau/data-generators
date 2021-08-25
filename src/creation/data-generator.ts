import { DataGenerator } from '../interfaces/data-generator.interface';

/**
 * Creates a Data Generator adhering to the interface, and automatically generates
 * the `createMany`, `map`, and `flatMap` functions using the `create` input provided.
 *
 * @category Creation
 * @param create The function that generates data.
 * @returns a {@link DataGenerator} of type T
 */
export const createGenerator = <T, A extends unknown[]>(
    create: (...args: A) => Iterable<T>
): ((...args: A) => DataGenerator<T>) => {
    return (...args: A) => {
        const gen = () => create(...args);
        return Object.assign(gen(), {
            create: () => single()(gen()),
            createMany: (length: number) => Array.from(take(length)(gen())),
            map: <U>(project: (output: T) => U) => map(project)(gen()),
            flatMap: <U>(project: (output: T) => DataGenerator<U>) => flatMap(project)(gen()),
            ap: <U>(projectGenerator: DataGenerator<(output: T) => U>) => ap(projectGenerator)(gen()),
            pipe(...fns: Array<(arg: any) => any>) {
                const firstFn = fns.shift();
                if (!firstFn) {
                    return this;
                }
                const firstInvocation = firstFn(gen());
                return fns.reduce((prev, cur) => cur(prev), firstInvocation);
            }
        });
    };
};

export function take(n: number) {
    return createGenerator(function* <T>(gen: Iterable<T>) {
        for (const val of gen) {
            yield val;
            if (!--n) break;
        }
    });
}

export function single() {
    return <T>(gen: Iterable<T>): T => [...take(1)(gen)][0];
}

export function map<T, U>(project: (v: T) => U) {
    return createGenerator(function* (gen: Iterable<T>) {
        for (const val of gen) {
            yield project(val);
        }
    });
}

export function flatMap<T, U>(project: (v: T) => Iterable<U>) {
    return createGenerator(function* (gen: Iterable<T>) {
        for (const x of gen) {
            yield* project(x);
        }
    });
}

export function ap<T, U>(projectGenerator: Iterable<(v: T) => U>) {
    return createGenerator(function* (gen: Iterable<T>) {
        for (const fn of projectGenerator) {
            for (const x of gen) {
                yield fn(x);
            }
        }
    });
}
