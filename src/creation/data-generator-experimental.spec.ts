import { ap, createGenerator, flatMap, take } from './data-generator';

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

    const fnGen = [(n: number | string) => `_${n}_`, (n: number | string) => `$${n}$`];

    const b = a(1).pipe(
        ap(fnGen),
        flatMap((str) => [str, 0])
    );

    console.log(b.createMany(17), b.pipe(take(6), ap(fnGen)).createMany(20));

    const c = struct({
        s: a(1),
        g: [1, 2, 3]
    });

    console.log(c.createMany(2), c.createMany(4));

    console.log(createGenerator(() => 'test').createMany(2))
});
