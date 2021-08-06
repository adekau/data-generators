import { DataGenerator } from './data-generator.interface';
import { integerGenerator } from './primitives';
import { struct } from './struct';

interface DateData {
    year: number;
    month: number;
    date?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
    ms?: number;
}

export type DateOverrideGenerators = { [K in keyof DateData]+?: DataGenerator<DateData[K]> };

const dateDataGenerator = (overrideGenerators?: DateOverrideGenerators): DataGenerator<DateData> =>
    struct<DateData>({
        year: overrideGenerators?.year ?? integerGenerator(1970, new Date().getFullYear() + 50),
        month: overrideGenerators?.month ?? integerGenerator(0, 11),
        date: overrideGenerators?.date ?? integerGenerator(1, 31),
        hours: overrideGenerators?.hours ?? integerGenerator(0, 23),
        minutes: overrideGenerators?.minutes ?? integerGenerator(0, 59),
        seconds: overrideGenerators?.seconds ?? integerGenerator(0, 59),
        ms: overrideGenerators?.ms ?? integerGenerator(0, 999)
    });

/**
 * Creates a random date with optional overrides for each part of the date.
 *
 * **Note**: Year defaults to 1970 to (current year + 50)
 *
 * @param overrideGenerators optional overrides of the generators used to generate each date piece
 * @returns a random date {@link DataGenerator}
 */
export const dateGenerator = (overrideGenerators?: DateOverrideGenerators): DataGenerator<Date> =>
    dateDataGenerator(overrideGenerators).map(({ year, month, date, hours, minutes, seconds, ms }) => new Date(year, month, date, hours, minutes, seconds, ms));
