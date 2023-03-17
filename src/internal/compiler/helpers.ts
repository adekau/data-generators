import { Zip } from 'ts-toolbelt/out/List/Zip';
import { Join } from 'ts-toolbelt/out/String/Join';
import { ListOf } from 'ts-toolbelt/out/Union/ListOf';
import { CONSTANTS } from './constants';

export type StructString<T extends any[]> = Join<
    ListOf<
        {
            [K in T[number] as Join<K>]: `"${K[0]}":${K[1]}`;
        }[Join<T[number]>]
    >,
    ','
>;

export const INDEX_NAME = CONSTANTS.INDEX;
export const createIndexCall = createCall('INDEX');
export const INDEX = {
    STRUCT: <T extends { [k: string]: string }>(memberMap: { [k in keyof T]: T[k] }) => {
        type keys = ListOf<keyof T>;
        type values = ListOf<T[keyof T]>;
        const arg = Object.entries(memberMap)
            .map(([k, v]) => `"${k}":${v}`)
            .join(',') as StructString<Zip<keys, values>>;
        return createIndexCall('STRUCT', arg);
    }
};

export const LIB_NAME = CONSTANTS.LIBRARY;
export const createLibCall = createCall('LIBRARY');
export const LIB = {
    STRING: createLibCall('STRING'),
    NUMBER: createLibCall('NUMBER')
};

export function createCall<T extends 'INDEX' | 'LIBRARY'>(where: T) {
    return <Call extends keyof typeof CONSTANTS, Args extends [...string[]]>(call: Call, ...args: Args) => {
        return `${(CONSTANTS as Pick<typeof CONSTANTS, T>)[where]}.${CONSTANTS[call]}(${
            (args ? args.join(',') : '') as Join<Args, ','>
        })` as const;
    };
}
