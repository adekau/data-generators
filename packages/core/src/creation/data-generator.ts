import { getBrand } from '../brand';
import { DataGenerator } from '../data-generator.interface';
import { isDataGenerator } from '../is-data-generator';
import { ap } from '../transformer/apply';
import { flatMap, map } from '../transformer/map';
import { one } from '../transformer/one';
import { pipe } from '../transformer/pipe';
import { take } from '../transformer/take';

/**
 * Lifts an iterable into a data generator allowing use of data transformation operators.
 *
 * @category Creation
 * @param gen A function that returns an iterable
 * @returns A new Data Generator that outputs based on the input `Iterable`.
 */
export function createGenerator<T>(gen: () => Iterable<T>): DataGenerator<T> {
    return Object.assign(gen(), <DataGenerator<T>>{
        brand: Symbol.for(getBrand()),
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
            const piped = pipe(gen, ...(fns as [any]));
            return isDataGenerator(piped) ? piped : createGenerator(piped as any);
        },
        [Symbol.iterator]() {
            return gen()[Symbol.iterator]();
        }
    });
}
