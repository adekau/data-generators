import { take } from "./take";

export function one<T>() {
    return function (gen: () => Iterable<T>) {
        return take(1)(gen);
    };
}
