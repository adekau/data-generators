import { iif } from './iif';

describe('Data Generators: iif', () => {
    it('should pick the true generator if predicate is true', () => {
        const gen = iif(() => true, [1, 2, 3], [4, 5, 6]);

        expect(gen.createAll()).toEqual([1, 2, 3]);
    });

    it('should pick the false generator if predicate is false', () => {
        const gen = iif(() => false, [1, 2, 3], [4, 5, 6]);

        expect(gen.createAll()).toEqual([4, 5, 6]);
    });
});
