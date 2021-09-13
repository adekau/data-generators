/**
 * @module input
 */

import * as dg from './dist/types/interfaces';
declare function build<T>(): dg.DataGenerator<T>;

const a = 5;

interface TestInterface {
    name: boolean;
    fn: (a: string) => number;
    a: typeof a;
    b: [number, string][0];
    c: undefined;
    d: null;
}

const t = build<TestInterface>();
t;
