export function take(n: number) {
    return function <T>(gen: () => Iterable<T>) {
        return function* () {
            let counter = 0;
            for (const val of gen()) {
                yield val;
                if (++counter === n) break;
            }
        };
    };
}
