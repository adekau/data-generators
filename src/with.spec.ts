import { withoutS, withoutT, withS } from './with';
import { struct } from './struct';
import { constant } from './constant';
import { bindS } from './bind';
import { booleanGenerator, charGenerator, integerGenerator, stringGenerator } from './primitives';
import { optional } from './optional';
import { tuple } from './tuple';
import { apT } from './apply';

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
            q: jasmine.stringMatching(/./)
        });
    });

    describe('Without', () => {
        it('should omit a struct property', () => {
            const gen = struct({
                n: constant<null>(null),
                q: stringGenerator(),
                t: integerGenerator()
            }).pipe(withoutS('n'));

            expect(gen.create()).toEqual({
                q: jasmine.any(String),
                t: jasmine.any(Number)
            });
        });

        it('should omit a tuple member', () => {
            const gen = tuple(constant<null>(null), optional(stringGenerator()), integerGenerator()).pipe(withoutT(1));

            expect(gen.create().length).toBe(2);
            expect(gen.create()).toEqual([null, jasmine.any(Number)]);
        });

        it('should add a tuple member and omit a different member', () => {
            const gen = tuple(constant(5), constant('s'), booleanGenerator()).pipe(apT(constant({})), withoutT(2));

            expect(gen.create().length).toBe(3);
            expect(gen.create()).toEqual([5, 's', {}]);
        });
    });
});
