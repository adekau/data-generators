import { constant } from './constant';
import { charGenerator, stringGenerator } from '../library/primitives';
import { constantSequence, sequence } from './sequence';
import { struct } from './struct';
import { createGenerator } from './data-generator';

describe('Data Generators: Sequence', () => {
    it('should sequence generators in order', () => {
        const gen = sequence(stringGenerator(5), constant('test'), charGenerator, constant('sequence'));

        expect(gen.createAll()).toEqual([
            expect.stringMatching(/.{5}/),
            'test',
            expect.stringMatching(/./),
            'sequence'
        ]);
    });

    it('should sequence generators in order with createMany', () => {
        const gen = sequence(constant('a'), constant('b'), constant('c'), constant('d'), constant('e'));

        expect(gen.createMany(3)).toEqual(['a', 'b', 'c']);
        expect(gen.createMany(10)).toEqual(['a', 'b', 'c', 'd', 'e']);
    });

    it('should sequence generators in structs', () => {
        const gen = struct({
            message: sequence(constant('hello world'), constant('test string'), constant('chocolate')),
            aString: stringGenerator(5)
        });

        expect(gen.create()).toEqual({
            message: 'hello world',
            aString: expect.any(String)
        });
        expect(gen.createMany(3)).toEqual([
            {
                message: 'hello world',
                aString: expect.any(String)
            },
            {
                message: 'test string',
                aString: expect.any(String)
            },
            {
                message: 'chocolate',
                aString: expect.any(String)
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
        const gen = sequence(constant(5), constant(8)).flatMap((length) => stringGenerator(length).one());

        expect(gen.createAll()).toEqual([expect.stringMatching(/.{5}/), expect.stringMatching(/.{8}/)]);
    });

    describe('Constant Sequence', () => {
        it('should create constant sequences', () => {
            // alias for sequence(constant(..), constant(..), ...);
            const gen = constantSequence(5, 6, 7, 8, 9, 10);

            expect(gen.createAll()).toEqual([5, 6, 7, 8, 9, 10]);
        });
    });
});
