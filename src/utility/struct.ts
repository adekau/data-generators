import { _partialStruct, _struct } from '../creation/struct';
import { map } from '../transformer/map';

/**
 * Creates a function that returns a new DataGenerator with properties of the original DataGenerator being optionally overridden.
 *
 * @category Utility
 * @param dataGenerator The object DataGenerator to provide overrides for.
 * @returns a function that overrides the selected properties.
 */
export const withOverrides =
    <T extends object>() =>
    (dataGenerator: () => Iterable<T>) => {
        return (generatorOverrides?: { [K in keyof T]+?: Iterable<T[K]> }): Iterable<T> =>
            map(({ original, overrides }: { original: T; overrides: object }) =>
                Object.assign({}, original, overrides)
            )(_struct({ original: dataGenerator(), overrides: _partialStruct(generatorOverrides ?? {})() }))();
    };
