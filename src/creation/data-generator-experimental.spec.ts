import { ap, createGenerator, flatMap, map, take } from './data-generator';

describe('dg-experimental', () => {
    const a = createGenerator(function* (start: number) {
        while (true) {
            yield start++;
        }
    });

    console.log(
        a(1)
            .map((n) => `${n}`)
            .pipe(map((n) => `${n}!`), flatMap((a) => [`${a}_`, 2]))
            .create()
    );
});
