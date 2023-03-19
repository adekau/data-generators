import { PFst, UFn } from 'semble-ts/types';

/**
 * Provides the ability to pipeline [[`transformer`]]s together.
 *
 * @category Transformer
 * @param fns the functions to pipe together using the calling DataGenerator as the initial input
 * @return the result of piping the DataGenerator through all the pipeline functions
 */
export function pipe<T, T1>(fn: () => Iterable<T>, fn1: PFst<T, T1>): T1;
export function pipe<T, T1, T2>(fn: () => Iterable<T>, fn1: PFst<T, T1>, fn2: UFn<T1, T2>): T2;
export function pipe<T, T1, T2, T3>(fn: () => Iterable<T>, fn1: PFst<T, T1>, fn2: UFn<T1, T2>, fn3: UFn<T2, T3>): T3;
export function pipe<T, T1, T2, T3, T4>(
    fn: () => Iterable<T>,
    fn1: PFst<T, T1>,
    fn2: UFn<T1, T2>,
    fn3: UFn<T2, T3>,
    fn4: UFn<T3, T4>
): T4;
export function pipe<T, T1, T2, T3, T4, T5>(
    fn: () => Iterable<T>,
    fn1: PFst<T, T1>,
    fn2: UFn<T1, T2>,
    fn3: UFn<T2, T3>,
    fn4: UFn<T3, T4>,
    fn5: UFn<T4, T5>
): T5;
export function pipe<T, T1, T2, T3, T4, T5, T6>(
    fn: () => Iterable<T>,
    fn1: PFst<T, T1>,
    fn2: UFn<T1, T2>,
    fn3: UFn<T2, T3>,
    fn4: UFn<T3, T4>,
    fn5: UFn<T4, T5>,
    fn6: UFn<T5, T6>
): T6;
export function pipe<T, T1, T2, T3, T4, T5, T6, T7>(
    fn: () => Iterable<T>,
    fn1: PFst<T, T1>,
    fn2: UFn<T1, T2>,
    fn3: UFn<T2, T3>,
    fn4: UFn<T3, T4>,
    fn5: UFn<T4, T5>,
    fn6: UFn<T5, T6>,
    fn7: UFn<T6, T7>
): T7;
export function pipe<T, T1, T2, T3, T4, T5, T6, T7, T8>(
    fn: () => Iterable<T>,
    fn1: PFst<T, T1>,
    fn2: UFn<T1, T2>,
    fn3: UFn<T2, T3>,
    fn4: UFn<T3, T4>,
    fn5: UFn<T4, T5>,
    fn6: UFn<T5, T6>,
    fn7: UFn<T6, T7>,
    fn8: UFn<T7, T8>
): T8;
export function pipe<T, T1, T2, T3, T4, T5, T6, T7, T8, T9>(
    fn: () => Iterable<T>,
    fn1: PFst<T, T1>,
    fn2: UFn<T1, T2>,
    fn3: UFn<T2, T3>,
    fn4: UFn<T3, T4>,
    fn5: UFn<T4, T5>,
    fn6: UFn<T5, T6>,
    fn7: UFn<T6, T7>,
    fn8: UFn<T7, T8>,
    fn9: UFn<T8, T9>
): T9;
export function pipe<T, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
    fn: () => Iterable<T>,
    fn1: PFst<T, T1>,
    fn2: UFn<T1, T2>,
    fn3: UFn<T2, T3>,
    fn4: UFn<T3, T4>,
    fn5: UFn<T4, T5>,
    fn6: UFn<T5, T6>,
    fn7: UFn<T6, T7>,
    fn8: UFn<T7, T8>,
    fn9: UFn<T8, T9>,
    fn10: UFn<T9, T10>
): T10;
export function pipe<T, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11>(
    fn: () => Iterable<T>,
    fn1: PFst<T, T1>,
    fn2: UFn<T1, T2>,
    fn3: UFn<T2, T3>,
    fn4: UFn<T3, T4>,
    fn5: UFn<T4, T5>,
    fn6: UFn<T5, T6>,
    fn7: UFn<T6, T7>,
    fn8: UFn<T7, T8>,
    fn9: UFn<T8, T9>,
    fn10: UFn<T9, T10>,
    fn11: UFn<T10, T11>
): T11;
export function pipe<T, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12>(
    fn: () => Iterable<T>,
    fn1: PFst<T, T1>,
    fn2: UFn<T1, T2>,
    fn3: UFn<T2, T3>,
    fn4: UFn<T3, T4>,
    fn5: UFn<T4, T5>,
    fn6: UFn<T5, T6>,
    fn7: UFn<T6, T7>,
    fn8: UFn<T7, T8>,
    fn9: UFn<T8, T9>,
    fn10: UFn<T9, T10>,
    fn11: UFn<T10, T11>,
    fn12: UFn<T11, T12>
): T12;
export function pipe<T>(fn: () => Iterable<T>, ...fns: any[]): any {
    return fns.reduce((y, f) => f(y), fn);
}
