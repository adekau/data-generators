import { DataGenerator } from 'semble-ts/interfaces';
import { StringLike } from 'semble-ts/types';
import { infinite } from './infinite';

/**
 * Tag function that generates an interpolated string using other data generators.
 *
 * @category Creation
 * @param strings string literal components of the template string
 * @param expressions expressions contained in the interpolated `${expression}` syntax of the template string
 * @returns a data generator that generates the interpolated string using the specified `${generator}` expressions.
 * @example
 * ```
 * enum Names {
 *   Alex = 'Alex',
 *   John = 'John',
 *   Cindy = 'Cindy',
 *   Erica = 'Erica'
 * }
 * const gen = interpolate`Hello, ${enumValue(Names)}!`;
 * const greeting = gen.create();
 * // greeting = 'Hello, Cindy!'
 * ```
 */
export function interpolate<TGens extends DataGenerator<StringLike>[]>(
    strings: TemplateStringsArray,
    ...expressions: TGens
): DataGenerator<string> {
    return infinite(() => {
        return strings.reduce((acc, cur, i) => {
            return acc + cur + (expressions[i]?.create().toString() ?? '');
        }, '');
    });
}
