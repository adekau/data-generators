import { dateGenerator } from './date';
import { integerGenerator } from './primitives';

describe('Data Generators: Date', () => {
    it('should generate a date with no overrides', () => {
        const dates = dateGenerator().createMany(5);

        expect(dates.every((x) => x instanceof Date)).toBe(true);
        expect(dates.every((x) => !isNaN(x.getTime()))).toBe(true);
    });

    it('should generate a date before this year', () => {
        const today = new Date();

        const dates = dateGenerator({
            year: integerGenerator(1970, today.getFullYear() - 1)
        }).createMany(5);

        expect(dates.every((x) => x instanceof Date)).toBe(true);
        expect(dates.every((x) => !isNaN(x.getTime()))).toBe(true);
        expect(dates.every((x) => x.getFullYear() < today.getFullYear())).toBe(true);
    });

    it('should generate a date in the AM with minutes in the first half of the hour', () => {
        const dates = dateGenerator({
            hours: integerGenerator(0, 11),
            minutes: integerGenerator(0, 29)
        }).createMany(5);

        expect(dates.every((x) => x instanceof Date)).toBe(true);
        expect(dates.every((x) => !isNaN(x.getTime()))).toBe(true);
        expect(dates.every((x) => x.getHours() < 12)).toBe(true);
        expect(dates.every((x) => x.getMinutes() < 30)).toBe(true);
    });
});
