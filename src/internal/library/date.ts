import { struct } from '../creation/struct';
import { integerGenerator } from './primitives';

export type DateData = {
    [K in 'year' | 'month' | 'date' | 'hours' | 'minutes' | 'seconds' | 'ms']: number;
};

/**
 * Creates a random date with optional overrides for each part of the date.
 *
 * **Note**: Year defaults to 1970 to (current year + 50)
 *
 * @category Library
 * @param generatorOverrides optional overrides of the generators used to generate each date piece
 * @returns a random date {@link DataGenerator}
 */
export const dateGenerator = (generatorOverrides?: { [K in keyof DateData]+?: Iterable<DateData[K]> }) =>
    struct<DateData>({
        year: generatorOverrides?.year ?? integerGenerator(new Date().getFullYear() - 50, new Date().getFullYear() + 50),
        month: generatorOverrides?.month ?? integerGenerator(0, 11),
        date: generatorOverrides?.date ?? integerGenerator(1, 31),
        hours: generatorOverrides?.hours ?? integerGenerator(0, 23),
        minutes: generatorOverrides?.minutes ?? integerGenerator(0, 59),
        seconds: generatorOverrides?.seconds ?? integerGenerator(0, 59),
        ms: generatorOverrides?.ms ?? integerGenerator(0, 999)
    }).map(
        ({ year, month, date, hours, minutes, seconds, ms }) => new Date(year, month, date, hours, minutes, seconds, ms)
    );
