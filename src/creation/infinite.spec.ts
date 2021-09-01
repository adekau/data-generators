import { infinite } from './infinite';

describe('Data Generators: Infinite', () => {
    it('should create an infinite stream', () => {
        const gen = infinite(() => 5);

        expect(gen.createMany(100).length).toBe(100);
    });
});
