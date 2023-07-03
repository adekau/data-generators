import { createGenerator } from './data-generator';

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

export function _struct<T extends object>(gens: { [K in keyof T]: Iterable<T[K]> }) {
    return function* () {
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
                    return;
                }
            }
            yield result;
        }
    };
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
