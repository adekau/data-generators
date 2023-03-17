import { Zip } from 'ts-toolbelt/out/List/Zip';
import { Join } from 'ts-toolbelt/out/String/Join';
import { Literal } from 'ts-toolbelt/out/String/_Internal';
import { ListOf } from 'ts-toolbelt/out/Union/ListOf';
import { CONSTANTS } from './constants';

export type StructString<T extends { [k: string]: string }> = `{${Join<
    ListOf<
        {
            [K in keyof T]: `"${K & string}":${T[K]}`;
        }[keyof T]
    >,
    ','
>}}`;

export type ConstantString<T extends Literal | undefined | null> = `${T}`;

export const INDEX_NAME = CONSTANTS.INDEX;
export const createIndexCall = createCall('INDEX');
export const INDEX = {
    STRUCT: <T extends { [k: string]: string }>(memberMap: { [k in keyof T]: T[k] }) => {
        const arg = `{${Object.entries(memberMap)
            .map(([k, v]) => `"${k}":${v}`)
            .join(',')}}` as StructString<T>;
        return createIndexCall('STRUCT', arg);
    },
    TUPLE: <T extends string[]>(...args: T) => {
        return createIndexCall('TUPLE', ...args);
    },
    ARRAY: <T extends string>(arg: T) => {
        return createIndexCall('ARRAY', arg);
    },
    CONSTANT: <T extends Literal | undefined | null>(arg: T) => {
        return createIndexCall('CONSTANT', arg as ConstantString<T>);
    },
    ANY_OF: <T extends string[]>(...args: T) => {
        return createIndexCall('ANY_OF', ...args);
    }
};

export const LIB_NAME = CONSTANTS.LIBRARY;
export const createLibCall = createCall('LIBRARY');
export const LIB = {
    STRING: createLibCall('STRING'),
    NUMBER: createLibCall('NUMBER'),
    BOOLEAN: createLibCall('BOOLEAN'),
    DATE: createLibCall('DATE'),
    FUNC: <T extends string>(output: T) => createLibCall('FUNCTION', output)
};

const q = {
    test: LIB.FUNC(LIB.NUMBER),
    authorId: LIB.STRING
};

export function createCall<T extends 'INDEX' | 'LIBRARY'>(where: T) {
    return <Call extends keyof typeof CONSTANTS, Args extends [...string[]]>(call: Call, ...args: Args) => {
        return `${(CONSTANTS as Pick<typeof CONSTANTS, T>)[where]}.${CONSTANTS[call]}(${
            (args ? args.join(',') : '') as Join<Args, ','>
        })` as const;
    };
}
