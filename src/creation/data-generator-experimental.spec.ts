import { createGenerator } from './data-generator';
import { apS } from '../transformer/apply';
import { withS } from '../transformer/with';
import { bindS, bindToS } from '../transformer/bind';
import { constant } from './constant';

function struct<T extends object>(gens: { [K in keyof T]: Iterable<T[K]> }) {
    return createGenerator(function* () {
        const iterators: [string, Iterator<unknown>][] = Object.entries(gens).map(([key, iterable]) => [
            key,
            (iterable as any)[Symbol.iterator]()
        ]);

        while (true) {
            const result: T = {} as T;
            for (const [key, it] of iterators) {
                const { value, done } = it.next();
                if (!done) {
                    result[key] = value;
                } else {
                    return;
                }
            }
            yield result;
        }
    });
}

describe('dg-experimental', () => {
    const a = (start: number) =>
        createGenerator(function* () {
            let i = start;
            while (true) {
                yield i++;
            }
        });
    const ch = a(32).map(String.fromCharCode);

    const c = struct({
        s: a(1),
        g: a(15),
        c: ch
    });
    const d = c.pipe(
        bindToS('test'),
        bindS('q', ({ test }) => constant(`${test.c}_!`).one())
    );
});
