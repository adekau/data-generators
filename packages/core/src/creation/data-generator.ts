import { getBrand } from '../brand';
import { ApplyArgs, ApplyReturn, BindArgs, BindReturn, DataGenerator } from '../data-generator.interface';
import { isDataGenerator } from '../is-data-generator';
import { ap, apS, apT } from '../transformer/apply';
import { bindS, bindT, bindToS, bindToT } from '../transformer/bind';
import { flatMap, map } from '../transformer/map';
import { one } from '../transformer/one';
import { pipe } from '../transformer/pipe';
import { take } from '../transformer/take';
import { withS, withT, withoutS, withoutT } from '../transformer/with';

/**
 * Lifts an iterable into a data generator allowing use of data transformation operators.
 *
 * @category Creation
 * @param gen A function that returns an iterable
 * @returns A new Data Generator that outputs based on the input `Iterable`.
 */
export function createGenerator<T>(gen: () => Iterable<T>, type?: 'struct' | 'tuple'): DataGenerator<T> {
    return Object.assign(gen(), <DataGenerator<T>>{
        brand: Symbol.for(getBrand()),
        type,
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
            return createGenerator(map(project)(gen), this.type);
        },
        flatMap<U>(project: (t: T) => DataGenerator<U>) {
            return createGenerator(flatMap(project)(gen), this.type);
        },
        ap<U>(projectGenerator: DataGenerator<(t: T) => U>) {
            return createGenerator(ap(projectGenerator)(gen), this.type);
        },
        one() {
            return createGenerator(one<T>()(gen), this.type);
        },
        take(n: number) {
            return createGenerator(take(n)(gen), this.type);
        },
        pipe(...fns: any[]): any {
            const piped = pipe(gen, ...(fns as [any]));
            return isDataGenerator(piped) ? piped : createGenerator(piped as any);
        },
        with<U extends keyof T>(name: U, using: Iterable<T[U]>) {
            switch (this.type) {
                case 'struct':
                    return createGenerator((withS as any)(name, using)(gen), 'struct');
                case 'tuple':
                    return createGenerator((withT as any)(name, using)(gen), 'tuple');
                default:
                    throw new Error('DataGenerator must be either a struct or tuple generator.');
            }
        },
        without<U extends keyof T>(without: U) {
            switch (this.type) {
                case 'struct':
                    return createGenerator((withoutS as any)(without)(gen), 'struct');
                case 'tuple':
                    return createGenerator((withoutT as any)(without)(gen), 'tuple');
                default:
                    throw new Error('DataGenerator must be either a struct or tuple generator.');
            }
        },
        bind<U, TName extends string>(...args: BindArgs<T, U, TName>): BindReturn<T, U, TName> {
            switch (this.type) {
                case 'struct':
                    return createGenerator((bindS as any)(...args)(gen), 'struct') as any;
                case 'tuple':
                    return createGenerator((bindT as any)(...args)(gen), 'tuple') as any;
                default:
                    throw new Error('DataGenerator must be either a struct or tuple generator.');
            }
        },
        bindToStruct<TName extends string>(name: TName): DataGenerator<{ [K in TName]: T }> {
            return createGenerator(bindToS<TName, T>(name)(gen), 'struct');
        },
        bindToTuple(): DataGenerator<[T]> {
            return createGenerator(bindToT<T>()(gen), 'tuple');
        },
        apply<U, TName extends string>(...args: ApplyArgs<T, U, TName>): ApplyReturn<T, U, TName> {
            switch (this.type) {
                case 'struct':
                    return createGenerator((apS as any)(...args)(gen), 'struct') as any;
                case 'tuple':
                    return createGenerator((apT as any)(...args)(gen), 'tuple') as any;
                default:
                    throw new Error('DataGenerator must be either a struct or tuple generator.');
            }
        },
        [Symbol.iterator]() {
            return gen()[Symbol.iterator]();
        }
    });
}
