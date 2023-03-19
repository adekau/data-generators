import { List } from 'ts-toolbelt';
import { Tail } from './flat.type';

export type IterableTuple<T extends Iterable<unknown>[], Final extends unknown[] = []> = {
    0: List.Head<T> extends Iterable<infer U> ? IterableTuple<Tail<T>, [...Final, U]> : Final;
    1: Final;
}[T['length'] extends 0 ? 1 : 0];
