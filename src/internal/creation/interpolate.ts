import { DataGenerator } from "../interfaces/data-generator.interface";
import { infinite } from "./infinite";

type StringLike = { toString: () => string };

export function interpolate<TGens extends DataGenerator<StringLike>[]>(strings: TemplateStringsArray, ...expressions: TGens): DataGenerator<string> {
    return infinite(() => {
        return strings.reduce((acc, cur, i) => {
            return acc + cur + (expressions[i]?.create().toString() ?? '');
        }, '');
    });
}