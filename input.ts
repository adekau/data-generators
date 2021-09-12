/**
 * @module input
 */

import * as dg from './dist/types/interfaces';
declare function build<T>(): dg.DataGenerator<T>;

class TestClass {
    species: string;
}

interface TestInterface {
    name: string;
    age: number;
    children: number;
    birthDate: Date;
    something: {
        somethingTwo: string;
    };
    somethingElse: 5;
}

const t = build<TestInterface>().create();
const t2 = build<number>().create();
const t3 = build<Date>().create();
const t4 = build<TestClass>().create();
t;
t2;
t3;
t4;
