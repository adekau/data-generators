import { constant } from './constant';

describe('Data Generators: Constant', () => {
    it('should generate a constant value', () => {
        expect(constant('hello world').create()).toBe('hello world');
        expect(constant('test data').createMany(2)).toEqual(['test data', 'test data']);
    });
});
