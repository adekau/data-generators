import { constant } from './constant';
import { dgMap } from './data-generator';
import { DataGenerator } from './data-generator.interface';
import { defer } from './defer';
import { booleanGenerator, integerGenerator, stringGenerator } from './primitives';
import { constantSequence } from './sequence';
import { struct, withOverrides } from './struct';
import { uuidGenerator } from './uuid-generator';

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
