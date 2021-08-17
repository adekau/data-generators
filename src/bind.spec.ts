import { apS } from './apply';
import { bindS, bindT, bindToS, bindToT } from './bind';
import { constant } from './constant';
import { incrementGenerator } from './increment';
import { booleanGenerator, integerGenerator, stringGenerator } from './primitives';
import { struct } from './struct';
import { tuple } from './tuple';

describe('Data Generators: Bind', () => {
    it('should bind an existing data generator', () => {
        const gen = stringGenerator().pipe(bindToS('a'));

        expect(gen.create()).toEqual({
            a: jasmine.stringMatching(/.{10}/)
        });
    });

    it('should bind with previous data', () => {
        const gen = struct({
            a: integerGenerator()
        }).pipe(bindS('b', ({ a }) => constant(`Your number is ${a}.`)));

        const result = gen.create();
        expect(result.a).toBeInstanceOf(Number);
        expect(result.b).toBe(`Your number is ${result.a}.`);
    });

    it('should bind with an existing struct', () => {
        const gen = incrementGenerator(1).pipe(
            bindToS('i'),
            bindS('a', ({ i }) => stringGenerator(i)),
            bindToS('test'),
            bindS('z', ({ test: { a, i } }) => constant(`(${a},${i})`))
        );

        expect(gen.create()).toEqual({
            test: {
                i: 1,
                a: jasmine.stringMatching(/./)
            },
            z: jasmine.stringMatching(/\(.,1\)/)
        });
    });

    it('uses apS to generate points', () => {
        const gen = incrementGenerator(1).pipe(
            bindToS('a'),
            apS('b', incrementGenerator(5)),
            bindToS('point'),
            bindS('display', ({ point: { a, b } }) => constant(`( ${a}, ${b} )`))
        );

        expect(gen.createMany(3)).toEqual([
            {
                point: { a: 1, b: 5 },
                display: '( 1, 5 )'
            },
            {
                point: { a: 2, b: 6 },
                display: '( 2, 6 )'
            },
            {
                point: { a: 3, b: 7 },
                display: '( 3, 7 )'
            }
        ]);
    });

    describe('tuple', () => {
        it('should bind to a tuple', () => {
            const gen = integerGenerator().pipe(bindToT());

            expect(gen.create()).toEqual([jasmine.any(Number)]);
        });

        it('should bind a tuple', () => {
            const gen = tuple(integerGenerator(), booleanGenerator()).pipe(bindT(([n]) => stringGenerator(n)));

            const result = gen.create();
            expect(result[0]).toBeInstanceOf(Number);
            expect(result[1]).toBeInstanceOf(Boolean);
            expect(result[2]).toBeInstanceOf(String);
            expect(result[2].length).toBe(result[0]);
        });
    });
});
