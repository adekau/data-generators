import { enumValueGenerator } from '../library/enum';
import { many } from '../transformer/many';
import {
    booleanGenerator,
    charGenerator,
    integerGenerator,
    numberGenerator,
    stringGenerator
} from '../library/primitives';
import { struct } from './struct';
import { tuple } from './tuple';

enum TestEnum {
    Value1 = 'testValue1',
    Value2 = 'testValue2',
    Value3 = 'testValue3'
}

describe('Data Generators: Tuple', () => {
    it('should generate a tuple of length 9 (largest overload)', () => {
        const gen = tuple(
            integerGenerator(),
            booleanGenerator(),
            stringGenerator(),
            charGenerator,
            enumValueGenerator(TestEnum),
            numberGenerator(5, 20),
            integerGenerator(2, 10),
            struct({ bool: booleanGenerator(), num: numberGenerator() }),
            booleanGenerator().pipe(many(3))
        );
        const data = gen.create();

        expect(data.length).toBe(9);
        expect(Number.isInteger(data[0])).toBeTrue();
        expect(data[1]).toBeInstanceOf(Boolean);
        expect(data[2]).toBeInstanceOf(String);
        expect(data[3]).toBeInstanceOf(String);
        expect(data[3].length).toBe(1);
        expect(data[4] === TestEnum.Value1 || data[4] === TestEnum.Value2 || data[4] === TestEnum.Value3).toBeTrue();
        expect(data[5]).toBeInstanceOf(Number);
        expect(data[5] >= 5 && data[5] <= 20).toBeTrue();
        expect(Number.isInteger(data[6])).toBeTrue();
        expect(data[6] >= 2 && data[6] <= 10).toBeTrue();
        expect(data[7].bool).toBeInstanceOf(Boolean);
        expect(data[7].num).toBeInstanceOf(Number);
        expect(data[8].length).toBe(3);
        expect(data[8].every((x: any) => typeof x === 'boolean')).toBeTrue();
    });
});
