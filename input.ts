import * as dg from './dist/types/interfaces';
declare function build<T>(): dg.DataGenerator<T>;

interface InterfaceTwo {
    subProperty: boolean;
}

interface TestInterface {
    name: string;
    age: number;
    children: number;
    birthDate: Date;
    another: InterfaceTwo;
}

const t = build<TestInterface>().create();