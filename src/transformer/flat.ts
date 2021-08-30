import { Flat } from '../interfaces/data-generator.interface';

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
