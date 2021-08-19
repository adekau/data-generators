import { constant } from './constant';
import { charGenerator, stringGenerator } from '../library/primitives';
import { constantSequence, sequence } from './sequence';
import { struct } from './struct';

describe('Data Generators: Sequence', () => {
    it('should sequence generators in order', () => {
        const gen = sequence(stringGenerator(5), constant('test'), charGenerator, constant('sequence'));

        expect(gen.create()?.length).toBe(5);
        expect(gen.create()).toBe('test');
        expect(gen.create()?.length).toBe(1);
        expect(gen.create()).toBe('sequence');
        expect(gen.create()).toBeUndefined();
        expect(gen.create()).toBeUndefined();
    });

    it('should sequence generators in order with createMany', () => {
        const gen = sequence(constant('a'), constant('b'), constant('c'), constant('d'), constant('e'));

        expect(gen.create()).toBe('a');
        expect(gen.createMany(2)).toEqual(['b', 'c']);
        expect(gen.create()).toBe('d');
        expect(gen.createMany(3)).toEqual(['e', undefined, undefined]);
    });

    it('should sequence generators in structs', () => {
        const gen = struct({
            message: sequence(constant('hello world'), constant('test string'), constant('chocolate')),
            aString: stringGenerator(5)
        });

        expect(gen.create()).toEqual({
            message: 'hello world',
            aString: jasmine.any(String)
        });
        expect(gen.createMany(3)).toEqual([
            {
                message: 'test string',
                aString: jasmine.any(String)
            },
            {
                message: 'chocolate',
                aString: jasmine.any(String)
            },
            {
                message: undefined,
                aString: jasmine.any(String)
            }
        ]);
    });

    it('should sequence with map', () => {
        const gen = sequence(constant('Mike'), constant('Jim')).map((name) => name?.concat('!'));

        expect(gen.createMany(2)).toEqual(['Mike!', 'Jim!']);
    });

    it('should sequence with flatMap', () => {
        // first 2 strings will be lengths 5 and 8 respectively, then it becomes a normal default
        // length string generator (length 10).
        const gen = sequence(constant(5), constant(8)).flatMap((length) => stringGenerator(length));

        expect(gen.create().length).toBe(5);
        expect(gen.create().length).toBe(8);
        // now it returns undefined, which means stringGenerator will default to 10
        expect(gen.create().length).toBe(10);
        expect(gen.create().length).toBe(10);
    });

    describe('Constant Sequence', () => {
        it('should create constant sequences', () => {
            // alias for sequence(constant(..), constant(..), ...);
            const gen = constantSequence(5, 6, 7, 8, 9, 10);

            expect(gen.createMany(8)).toEqual([5, 6, 7, 8, 9, 10, undefined, undefined]);
        });
    });
});
