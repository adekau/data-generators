import { DataGenerator } from "../interfaces/data-generator.interface";


export function createGenerator<T>(gen: () => Iterable<T>): DataGenerator<T> {
    return Object.assign(gen(), {
        create() {
            return [...take(1)(gen)()][0];
        },
        createMany(n: number) {
            return [...take(n)(gen)()];
        },
        map<U>(project: (t: T) => U) {
            return createGenerator(map(project)(gen));
        },
        flatMap<U>(project: (t: T) => DataGenerator<U>) {
            return createGenerator(flatMap(project)(gen));
        },
        ap<U>(projectGenerator: DataGenerator<(t: T) => U>) {
            return createGenerator(ap(projectGenerator)(gen));
        },
        pipe(...fns: any[]): any {
            return createGenerator(fns.reduce((y, f) => f(y), gen));
        },
        [Symbol.iterator]() {
            return gen()[Symbol.iterator]();
        }
    });
}

export function take(n: number) {
    return function <T>(gen: () => Iterable<T>) {
        return function* () {
            let counter = 0;
            for (const val of gen()) {
                yield val;
                if (++counter === n) break;
            }
        };
    };
}

export function map<T, U>(project: (t: T) => U) {
    return function (gen: () => Iterable<T>) {
        return function* () {
            for (const x of gen()) {
                yield project(x);
            }
        };
    };
}

export function flatMap<T, U>(project: (v: T) => Iterable<U>) {
    return function (gen: () => Iterable<T>) {
        return function* () {
            for (const x of gen()) {
                yield* project(x);
            }
        };
    };
}

export function ap<T, U>(projectGenerator: Iterable<(v: T) => U>) {
    return function (gen: () => Iterable<T>) {
        return function* () {
            for (const fn of projectGenerator) {
                for (const x of gen()) {
                    yield fn(x);
                }
            }
        };
    };
}
