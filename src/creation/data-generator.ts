import { DataGenerator, Flat } from '../interfaces/data-generator.interface';
import { ap } from '../transformer/apply';

export function createGenerator<T>(gen: () => Iterable<T>): DataGenerator<T> {
    return Object.assign(gen(), {
        create() {
            return [...take(1)(gen)()][0];
        },
        createMany(n: number) {
            return [...take(n)(gen)()];
        },
        createAll() {
            return [...this];
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
        one() {
            return createGenerator(one<T>()(gen));
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
        return flat<Iterable<Iterable<U>>>()(map(project)(gen));
    };
}

export function flatMapShallow<T, U>(project: (v: T) => Iterable<U>) {
    return function (gen: () => Iterable<T>) {
        return function* () {
            for (const x of gen()) {
                yield* project(x);
            }
        };
    };
}

function isIterable(x: any): x is Iterable<unknown> {
    return typeof x?.[Symbol.iterator] === 'function';
}

export function flat<T extends Iterable<unknown>>() {
    return function (gen: () => T) {
        return function* (): Generator<Flat<T>, void, unknown> {
            for (const x of gen()) {
                if (isIterable(x) && typeof x !== 'string') {
                    yield* flat()(() => x)() as any;
                } else {
                    yield x as any;
                }
            }
        };
    };
}

export function one<T>() {
    return function (gen: () => Iterable<T>) {
        return take(1)(gen);
    };
}
