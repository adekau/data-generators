import { B, L, N, U } from 'ts-toolbelt';
import { DataGenerator } from './data-generator.interface';
import { tuple } from './tuple';
import { OptionalKeyOf } from './util';

export const withS =
    <TName extends keyof A, A extends object>(name: TName, using: DataGenerator<A[TName]>) =>
    (dataGenerator: DataGenerator<A>): DataGenerator<A> => {
        return tuple(dataGenerator, using).map(([out, replace]) => Object.assign({}, out, { [name]: replace }));
    };

export const withT =
    <TIndex extends number, T extends unknown[]>(
        index: TIndex,
        using: B.Or<N.IsNegative<TIndex>, U.Has<N.Lower<TIndex, T['length']>, 0>> extends 1
            ? never
            : DataGenerator<T[TIndex]>
    ) =>
    (dataGenerator: DataGenerator<T>): DataGenerator<T> => {
        return tuple(dataGenerator, using).map(
            ([out, replace]) => [...out.slice(0, index), replace, ...out.slice(index + 1, out.length)] as any
        );
    };

export const withoutS =
    <TName extends OptionalKeyOf<A>, A extends object>(name: TName) =>
    (dataGenerator: DataGenerator<A>): DataGenerator<{ [K in keyof A as K extends TName ? never : K]: A[K] }> => {
        return dataGenerator.map(({ [name]: _, ...rest }) => rest) as any;
    };

export const withoutT =
    <TIndex extends number, T extends unknown[]>(index: TIndex) =>
    (
        dgT: DataGenerator<T>
    ): B.Or<N.IsNegative<TIndex>, U.Has<N.Lower<TIndex, T['length']>, 0>> extends 1
        ? DataGenerator<T>
        : DataGenerator<L.Omit<T, TIndex>> => {
        return dgT.map((t) => t.filter((_, i) => i !== index)) as any;
    };
