import { uuidGenerator } from './uuid';

describe('Data Generators: UUID', () => {
    it('should generate a UUID', () => {
        const result = uuidGenerator.create();
        const split = result.split('-');

        expect(split.length).toBe(5);
        expect(split[0].length).toBe(8);
        expect(split[1].length).toBe(4);
        expect(split[2].length).toBe(4);
        expect(split[3].length).toBe(4);
        expect(split[4].length).toBe(12);
    });
});
