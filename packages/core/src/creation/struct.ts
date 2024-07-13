import { List } from 'ts-toolbelt';
import { map } from '../transformer/map';
import { pipe } from '../transformer/pipe';
import { IterableFactoryWithType, createGenerator } from './data-generator';
import { _tuple } from './tuple';

/**
 * Creates a generator that generates an object adhering to an interface using the provided generators for
 * interface members. Can be thought of as behaving similarly to RxJS `forkJoin`.
 *
 * @category Creation
 * @param generators an object of generators matching the interface
 * @returns a generator that creates an object instance adhering to the interface
 * @example
 * ```
 * struct({
 *     isRequired: booleanGenerator(),
 *     fieldId: integerGenerator(),
 *     value: stringGenerator(6)
 * }).create();
 * // Example Output: { isRequired: true, fieldId: 52, value: 'aVE3^x' }
 * ```
 */
export function struct<T extends object>(gens: { [K in keyof T]: Iterable<T[K]> }) {
    return createGenerator(_struct(gens), 'struct');
}

export function _struct<T extends object>(gens: { [K in keyof T]: Iterable<T[K]> }): IterableFactoryWithType<T> {
    return Object.assign(
        function* () {
            const iterators: [string, Iterator<T[keyof T]>][] = Object.entries(gens).map(([key, iterable]) => [
                key,
                (iterable as any)[Symbol.iterator]()
            ]);

            while (true) {
                const result: T = {} as T;
                for (const [key, it] of iterators) {
                    const { value, done } = it.next();
                    if (!done) {
                        result[key as keyof T] = value;
                    } else {
                        return result;
                    }
                }
                yield result;
            }
        },
        {
            type: 'struct' as const
        }
    );
}

/**
 * Creates a generator that generates a potentially incomplete object adhering to a partial interface.
 *
 * @category Creation
 * @param generators an object of optional generators matching the interface
 * @returns a generator that creates a partial object using the provided generators
 */
export function partialStruct<T extends object>(gens: { [K in keyof T]+?: Iterable<T[K]> }) {
    return createGenerator(_partialStruct(gens), 'struct');
}

export function _partialStruct<T extends object>(gens: { [K in keyof T]+?: Iterable<T[K]> }) {
    return function* () {
        const iterators: [string, Iterator<T[keyof T]>][] = Object.entries(gens)
            .map(([key, iterable]) => [key, (iterable as any)?.[Symbol.iterator]()])
            .filter(([, x]) => x != null) as [string, Iterator<T[keyof T]>][];

        while (true) {
            const result: Partial<T> = {};
            for (const [key, it] of iterators) {
                const { value, done } = it.next();
                if (!done) {
                    result[key as keyof T] = value;
                } else {
                    return;
                }
            }
            yield result;
        }
    };
}

export type MergeStructs<T extends Iterable<object>[], Built extends object = {}> = {
    1: List.Head<T> extends Iterable<infer U>
        ? MergeStructs<List.Tail<T>, Built & U>
        : MergeStructs<List.Tail<T>, Built>;
    0: Built;
}[T['length'] extends 0 ? 0 : 1];

/**
 * Creates a generator that merges structs together into a single struct.
 *
 * @category Creation
 * @param gens the struct generators to merge
 * @returns a generator that merges the results of each provided struct generator together
 */
export function mergeStructs<T extends Iterable<object>[]>(...gens: T) {
    return createGenerator(_mergeStructs(...gens), 'struct');
}

export function _mergeStructs<T extends Iterable<object>[]>(...gens: T): IterableFactoryWithType<MergeStructs<T>> {
    return pipe(
        () => _tuple(...gens)(),
        map((structs) => {
            return Object.assign({}, ...(structs as any[]));
        })
    );
}
