/**
 * Limits a generator to `n` outputs.
 * 
 * @category Transformer
 * @param n the number of outputs to limit the generator to
 * @returns A finite Data Generator
 */
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
