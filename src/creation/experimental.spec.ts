interface DG<T, R = any, N = unknown> extends Generator<T, R, N> {
    createMany(n: number): T[];
}

fdescribe('Experimental', () => {
    // it('', () => {
    //     const gen = createDG(function* (start: number) {
    //         while (true) {
    //             yield start++;
    //         }
    //     });

    //     console.log(gen(1).createMany(3));
    // });

    // it('', () => {
    //     function* evens() {
    //         let start = 0;
    //         while (true) {
    //             yield start++ * 2;
    //         }
    //     }

    //     function* test(gen: Generator<any>) {
    //         while (true) {
    //             yield {
    //                 t: gen.next().value
    //             };
    //         }
    //     }

    //     const take = (n: number, g: Generator<any>) => {
    //         const ret = [];
    //         while (n--) {
    //             ret.push(g.next().value);
    //         }
    //         return ret;
    //     };

    //     const gen = test(evens());
    //     console.log(take(10, gen));
    // });

    // it('', () => {
    //     function* rangeIterator(start: number, end: number) {
    //         for (let i = start; i <= end; i++) {
    //             yield i;
    //         }
    //     }

    //     function* evenNumbers() {
    //         let i = 0;
    //         while (true) {
    //             yield (i += 2);
    //         }
    //     }

    //     for (const value of evenNumbers()) {
    //         if (value > 20) {
    //             break;
    //         }
    //     }
    // });

    // it('zip', () => {
    //     function* zip(...iterables: Iterable<unknown>[]) {
    //         const iterators = iterables.map((iterable) => iterable[Symbol.iterator]());

    //         while (true) {
    //             const result = [];
    //             for (const it of iterators) {
    //                 const { value, done } = it.next();
    //                 if (!done) {
    //                     result.push(value);
    //                 } else {
    //                     return;
    //                 }
    //             }
    //             yield result;
    //         }
    //     }

    //     const numbers = [1, 2, 3, 4, 5];
    //     const names = ['Test', 'Alex', 'D', 'Jim'];
    //     const cities = ['New York', 'Chicago', 'Michigan'];

    //     console.log([...zip(numbers, names, cities)]);
    // });

    function take(n: number) {
        return createG(function* <T>(gen: Iterable<T>) {
            for (const val of gen) {
                yield val;
                if (!--n) break;
            }
        });
    }

    function map<T, U>(project: (v: T) => U) {
        return function* (gen: Iterable<T>) {
            for (const val of gen) {
                yield project(val);
            }
        };
    }

    function flatMap<T, U>(project: (v: T) => Iterable<U>) {
        return function* (gen: Iterable<T>) {
            for (const x of gen) {
                yield* project(x);
            }
        };
    }

    const struct = createG(function* <T extends object>(gens: { [K in keyof T]: Iterable<T[K]> }) {
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

    // function createG<T, A extends unknown[]>(cr: (...args: A) => Iterable<T>) {
    //     return (...args: A) => {
    //         const gen = () => cr(...args);
    //         return Object.assign(gen, {
    //             createMany(n: number) {
    //                 return Array.from(take(n)(gen()));
    //             },
    //             map<U>(project: (v: T) => U) {
    //                 return createG(() => map(project)(gen()))();
    //             },
    //             pipe(...fns: any) {
    //                 return fns.reduce((y, f) => f(y), gen());
    //             }
    //         });
    //     };
    // }

    function createG<T, A extends unknown[]>(cr: (...args: A) => Iterable<T>) {
        return (...args: A) => {
            const gen = () => cr(...args);
            return Object.assign(gen(), {
                createMany(n: number) {
                    return Array.from(take(n)(gen()));
                },
                pipe(...fns: any) {
                    return fns.reduce((y, f) => f(y), gen());
                }
            });
        };
    }

    const num = createG(function* (min: number = 0, max: number = 1) {
        while (true) {
            yield min + Math.random() * (max - min);
        }
    });

    function int(min: number = 1, max: number = 100) {
        return map((n: number) => Math.round(n))(num(min, max));
    }

    // function* str(length: number = 10) {
    //     while (true) {
    //         yield [...take(length)(char())].join('');
    //     }
    // }

    const char = () => map((n: number) => String.fromCharCode(n))(int(32, 126));

    it('struct', () => {
        // console.log([...take(3)(map((n: number) => n < 0.5)(num()))]);

        const g = () => struct({
            a: num().pipe(take(5))
        });

        // const a = flatMap((n: number) => take(2)(str(n)))(int(1, 10));
        //num console.log([...take(11)(a)]);

        // const g = num() //.map((v) => v < 0.5);
        console.log(g().createMany(3), g().createMany(4), g().createMany(10));
        // console.log();
        // const g = num().pipe(take(2));
        // console.log([...g()], [...g()]);
    });
});
