import { DataGenerator } from '../interfaces/data-generator.interface';

/**
 * Creates a Data Generator adhering to the interface, and automatically generates
 * the `createMany`, `map`, and `flatMap` functions using the `create` input provided.
 *
 * @category Creation
 * @param create The function that generates data.
 * @returns a {@link DataGenerator} of type T
 */
export const createGenerator = <T>(create: () => Iterable<T>): DataGenerator<T> => {
    return Object.assign(create, {
        create: () => single()(create),
        createMany: (length: number) => Array.from(take(length)(gen)),
        map: <U>(project: (output: T) => U) => map(project)(gen)(),
        flatMap: <U>(project: (output: T) => DataGenerator<U>) => flatMap(project)(gen)(),
        ap: <U>(projectGenerator: Iterable<(output: T) => U>) => ap(projectGenerator)(gen)(),
        pipe(...fns: Array<(arg: any) => any>) {
            const firstFn = fns.shift();
            if (!firstFn) {
                return this;
            }
            const firstInvocation = firstFn(gen);
            return fns.reduce((prev, cur) => cur(prev), firstInvocation);
        }
    });
};

export function take(n: number) {
    return function <T>(gen: () => Iterable<T>) {
        return createGenerator(function* () {
            for (const val of gen()) {
                yield val;
                if (!--n) break;
            }
        });
    };
}

export function single() {
    return <T>(gen: () => Iterable<T>): T => [...take(1)(gen)()][0];
}

export function map<T, U>(project: (v: T) => U) {
    return function (gen: () => Iterable<T>) {
        return createGenerator(function* () {
            for (const val of gen()) {
                yield project(val);
            }
        });
    };
}

export function flatMap<T, U>(project: (v: T) => Iterable<U>) {
    return function (gen: () => Iterable<T>) {
        return createGenerator(function* () {
            for (const x of gen()) {
                yield* project(x);
            }
        });
    };
}

export function ap<T, U>(projectGenerator: Iterable<(v: T) => U>) {
    return function (gen: () => Iterable<T>) {
        return createGenerator(function* () {
            for (const fn of projectGenerator) {
                console.log('got fn');
                for (const x of gen()) {
                    console.log('got num');
                    yield fn(x);
                }
            }
        });
    };
}

// const _ap: <A>(fa: Iterable<A>) => <B>(fab: Iterable<(a: A) => B>) => () => DataGenerator<B> = (fa) =>
//     flatMap((f) => map(f)(fa)());

// export const ap: <A, B>(fab: Iterable<(a: A) => B>) => (fa: () => Iterable<A>) => DataGenerator<B> = (fab) => (fa) =>
//     _ap(fa())(fab);
