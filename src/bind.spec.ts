import { apS } from './apply';
import { bindS, bindTo } from './bind';
import { constant } from './constant';
import { incrementGenerator } from './increment';
import { integerGenerator, stringGenerator } from './primitives';
import { struct } from './struct';

describe('Data Generators: Bind', () => {
    it('should bind an existing data generator', () => {
        const gen = stringGenerator().pipe(bindTo('a'));

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
            bindTo('i'),
            bindS('a', ({ i }) => stringGenerator(i)),
            bindTo('test'),
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
            bindTo('a'),
            apS('b', incrementGenerator(5)),
            bindTo('point'),
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
});
