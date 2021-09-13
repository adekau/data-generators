/**
 * @module input
 */

import * as dg from './dist/types/interfaces';
declare function build<T>(): dg.DataGenerator<T>;

const enum Color {
    Red = 1,
    Blue = 2
}

interface TestInterface {
    name: `Bob`;
    age: number;
    date: Date;
    bool: boolean;
    col: Color;
    fn: (b: number) => boolean;
    und: void;
    something: {
        some: string;
    };
}

const t = build<TestInterface>();
t;
