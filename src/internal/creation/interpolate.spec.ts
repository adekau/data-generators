import { enumValue, int } from '../../library';
import { interpolate } from './interpolate';

enum Value1 {
    Value1 = 'value1',
    Value2 = 'value2',
    Value3 = 'value3'
}

enum Enum2 {
    Member1 = 'member1',
    Member2 = 'member2',
    Member3 = 'member3',
    Member4 = 'member4'
}

describe('Data Generators: Interpolate', () => {
    it('should interpolate a string of generators', () => {
        const gen = interpolate`${enumValue(Value1)}-${enumValue(Enum2)}:${int(100,999)}`;

        const results = gen.createMany(5);
        const check = /^value[1-3]-member[1-4]:\d{3}/;

        expect(results.every((result) => check.test(result))).toBeTrue();
    });
});