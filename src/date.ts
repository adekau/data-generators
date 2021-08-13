import { defer } from './defer';
import { integerGenerator } from './primitives';
import { struct, withOverrides } from './struct';

/**
 * Creates a random date with optional overrides for each part of the date.
 *
 * **Note**: Year defaults to 1970 to (current year + 50)
 *
 * @param generatorOverrides optional overrides of the generators used to generate each date piece
 * @returns a random date {@link DataGenerator}
 */
export const dateGenerator = struct({
    year: integerGenerator(1970, new Date().getFullYear() + 50),
    month: integerGenerator(0, 11),
    date: integerGenerator(1, 31),
    hours: integerGenerator(0, 23),
    minutes: integerGenerator(0, 59),
    seconds: integerGenerator(0, 59),
    ms: integerGenerator(0, 999)
}).pipe(
    withOverrides(),
    defer((dg) =>
        dg.map(
            ({ year, month, date, hours, minutes, seconds, ms }) =>
                new Date(year, month, date, hours, minutes, seconds, ms)
        )
    )
);
