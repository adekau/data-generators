import { DataGenerator } from '../interfaces/data-generator.interface';
import { ap } from '../transformer/apply';
import { flatMap, map } from '../transformer/map';
import { one } from '../transformer/one';
import { take } from '../transformer/take';

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
        take(n: number) {
            return createGenerator(take(n)(gen));
        },
        pipe(...fns: any[]): any {
            return createGenerator(fns.reduce((y, f) => f(y), gen));
        },
        [Symbol.iterator]() {
            return gen()[Symbol.iterator]();
        }
    });
}
