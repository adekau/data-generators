import { constant } from '../creation/constant';
import { constantSequence } from '../creation/sequence';
import { struct } from '../creation/struct';
import { DataGenerator } from '../interfaces/data-generator.interface';
import { booleanGenerator, integerGenerator, stringGenerator } from '../library/primitives';
import { uuidGenerator } from '../library/uuid-generator';
import { withOverrides } from '../utility/struct';
import { defer } from './defer';

describe('Data Generators: Defer', () => {
    it('should defer', () => {
        const fn = (num: number) => integerGenerator(0, 5).map((int) => int + num);
        const gen = defer((dg) => dg.map((num) => `Your number is ${num}`))(fn);

        const result = gen(100).create();
        expect(result.startsWith('Your number is ')).toBeTrue();
        expect(Number(result.replace('Your number is ', ''))).toBeGreaterThanOrEqual(100);
    });

    it('allows overriding original generators and mapping to something else using defer', () => {
        const gen2 = struct({
            id: uuidGenerator,
            value: stringGenerator(6),
            enabled: booleanGenerator()
        }).pipe(
            withOverrides(),
            defer((dg) => dg.map((v) => `${v.id}|${v.enabled}|${v.value}`))
        );

        const results = gen2({
            id: constant('hello'),
            value: constant('test'),
            enabled: constantSequence(true, false) as DataGenerator<boolean>
        }).createMany(2);

        expect(results).toEqual(['hello|true|test', 'hello|false|test']);
    });
});