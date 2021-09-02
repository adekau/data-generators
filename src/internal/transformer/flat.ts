import { Flat } from '../interfaces/data-generator.interface';

function isIterable(x: any): x is Iterable<unknown> {
    return typeof x?.[Symbol.iterator] === 'function';
}

/**
 * Recursively flattens a generator of generators into a generator of all the flattened generators' outputs.
 *
 * @category Transformer
 * @returns a flattened Data Generator
 */
export function flat<T extends Iterable<unknown>>() {
    return function (gen: () => T) {
        return function* (): Generator<Flat<T>, void, unknown> {
            for (const x of gen()) {
                if (isIterable(x) && typeof x !== 'string') {
                    yield* flat()(() => x)() as Generator<Flat<T>>;
                } else {
                    yield x as Flat<T>;
                }
            }
        };
    };
}
