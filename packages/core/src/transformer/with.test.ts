import { constant } from '../creation/constant';
import { struct } from '../creation/struct';
import { tuple } from '../creation/tuple';
import { booleanGenerator, charGenerator, integerGenerator, stringGenerator } from '../library/primitives';
import { apT } from './apply';
import { bindS, bindT } from './bind';
import { optional } from './optional';
import { withS, withT, withoutS, withoutT } from './with';

describe('Data Generators: With', () => {
    it("should replace a struct key's generator", () => {
        const gen = struct({
            str: constant('string')
        }).pipe(
            withS('str', constant('wow')),
            bindS('q', ({ str }) => constant(str.concat('q'))),
            withS('q', charGenerator)
        );

        expect(gen.create()).toEqual({
            str: 'wow',
            q: expect.stringMatching(/./)
        });
    });

    it("should replace a tuple member's generator", () => {
        const gen = tuple(constant('string')).pipe(
            bindT(([str]) => constant(`${str}!`)),
            withT(1, charGenerator)
        );

        expect(gen.create()).toEqual(['string', expect.stringMatching(/./)]);
    });

    it('should restrict an infinite generator to finite', () => {
        const gen = struct({
            char: charGenerator,
            str: stringGenerator(),
            int: integerGenerator()
        });

        expect(gen.createMany(5).length).toBe(5);

        const results = gen.pipe(withS('int', [1, 2, 3])).createMany(5);

        expect(results.length).toBe(3);
        expect(results).toEqual([
            {
                char: expect.stringMatching(/./),
                str: expect.stringMatching(/.{10}/),
                int: 1
            },
            {
                char: expect.stringMatching(/./),
                str: expect.stringMatching(/.{10}/),
                int: 2
            },
            {
                char: expect.stringMatching(/./),
                str: expect.stringMatching(/.{10}/),
                int: 3
            }
        ]);
    });

    it('should restrict an infinite generator to finite (tuple)', () => {
        const gen = tuple(charGenerator, stringGenerator(), integerGenerator());

        expect(gen.createMany(5).length).toBe(5);

        const results = gen.pipe(withT(2, [1, 2, 3])).createMany(5);

        expect(results.length).toBe(3);
        expect(results).toEqual([
            [expect.stringMatching(/./), expect.stringMatching(/.{10}/), 1],
            [expect.stringMatching(/./), expect.stringMatching(/.{10}/), 2],
            [expect.stringMatching(/./), expect.stringMatching(/.{10}/), 3]
        ]);
    });

    describe('Without', () => {
        it('should omit a struct property', () => {
            const gen = struct({
                n: constant<null>(null),
                q: stringGenerator(),
                t: integerGenerator()
            }).pipe(withoutS('n'));

            expect(gen.create()).toEqual({
                q: expect.any(String),
                t: expect.any(Number)
            });
        });

        it('should omit a tuple member', () => {
            const gen = tuple(constant<null>(null), optional(stringGenerator()), integerGenerator()).pipe(withoutT(1));

            expect(gen.create().length).toBe(2);
            expect(gen.create()).toEqual([null, expect.any(Number)]);
        });

        it('should add a tuple member and omit a different member', () => {
            const gen = tuple(constant(5), constant('s'), booleanGenerator()).pipe(apT(constant({})), withoutT(2));

            expect(gen.create().length).toBe(3);
            expect(gen.create()).toEqual([5, 's', {}]);
        });

        it('should not widen a stream', () => {
            const gen = struct({
                str: stringGenerator(),
                num: [1, 2, 9, 10]
            });

            expect(gen.createMany(5).length).toBe(4);
            expect(gen.pipe(withoutS('num')).createMany(5).length).toBe(4);
        });
    });
});
