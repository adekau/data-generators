import { B, L, N, T, U } from 'ts-toolbelt';
import { createGenerator } from '../creation/data-generator';
import { _struct } from '../creation/struct';
import { _tuple } from '../creation/tuple';
import { map } from './map';
import { pipe } from './pipe';

/**
 * Overrides the generator of a struct property.
 *
 * @category Transformer
 * @param name Name of struct key to override
 * @param using New generator to use in place of the old one
 * @returns A generator of the same type with `name` overridden.
 * @example
 * ```
 * integerGenerator().pipe(
 *     bindToS('int'),
 *     withS('int', constant(5))
 * ).create(); // { int: 5 }
 * ```
 */
export function withS<TName extends keyof A, A extends object>(name: TName, using: Iterable<A[TName]>) {
    return function (gen: () => Iterable<A>): () => Iterable<A> {
        return pipe(
            _struct({ out: gen(), replace: using }),
            map(({ out, replace }) => Object.assign({}, out, { [name]: replace }))
        );
    };
}
/**
 * Overrides the generator of a tuple member.
 *
 * @category Transformer
 * @param index Index of the tuple member to override
 * @param using New generator to use in place of the old one
 * @returns A generator of the same type with the generator at `index` overridden.
 * @example
 * ```
 * integerGenerator().pipe(
 *     bindToT(),
 *     withT(0, constant(5))
 * ).create(); // [5]
 * ```
 */
export const withT =
    <TIndex extends number, T extends unknown[]>(
        index: TIndex,
        using: B.Or<N.IsNegative<TIndex>, U.Has<N.Lower<TIndex, T['length']>, 0>> extends 1
            ? never
            : Iterable<T[TIndex]>
    ) =>
    (gen: () => Iterable<T>): (() => Iterable<T>) => {
        return pipe(
            _tuple(gen(), using),
            map(([out, replace]) => [...out.slice(0, index), replace, ...out.slice(index + 1, out.length)] as any)
        );
    };

/**
 * Omits a property of an object Data Generator from the output.
 *
 * @category Transformer
 * @param name Name of the struct member to omit
 * @returns An object Data Generator with the selected property omitted
 * @example
 * ```
 * struct({
 *     int: integerGenerator(),
 *     str: stringGenerator(),
 *     bool: booleanGenerator()
 * }).pipe(
 *     withoutS('str')
 * ).create(); // { int: 91, bool: false }
 * ```
 */
export const withoutS =
    <TName extends keyof A, A extends object>(name: TName) =>
    (gen: () => Iterable<A>): (() => Iterable<{ [K in keyof A as K extends TName ? never : K]: A[K] }>) => {
        return pipe(
            gen,
            map(({ [name]: _, ...rest }) => rest)
        ) as any;
    };

/**
 * Omits a member of a tuple Data Generator from the output.
 *
 * @category Transformer
 * @param index Index of the tuple member to omit
 * @returns A tuple Data Generator with the selected index omitted.
 * @example
 * ```
 * tuple(stringGenerator(), integerGenerator()).pipe(
 *     withoutT(0)
 * ).create(); // [28]
 * ```
 */
export const withoutT =
    <TIndex extends number, T extends unknown[]>(index: TIndex) =>
    (
        dgT: () => Iterable<T>
    ): B.Or<N.IsNegative<TIndex>, U.Has<N.Lower<TIndex, T['length']>, 0>> extends 1
        ? () => Iterable<T>
        : () => Iterable<L.Omit<T, TIndex>> => {
        return pipe(
            dgT,
            map((t) => t.filter((_, i) => i !== index))
        ) as any;
    };
