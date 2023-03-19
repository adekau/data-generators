import { String, Union } from 'ts-toolbelt';
import { CONSTANTS } from './constants';

type Literal = string | number | boolean;
export type StructString<T extends { [k: string]: string }> = `{${String.Join<
    Union.ListOf<
        {
            [K in keyof T]: `"${K & string}":${T[K]}`;
        }[keyof T]
    >,
    ','
>}}`;
export type ConstantString<T extends Literal | undefined | null> = `${T}`;
type InterpolateString<S extends string[], Quote extends string = '"'> = `[${String.Join<
    {
        [K in keyof S]: `${Quote}${S[K]}${Quote}`;
    },
    ','
>}]`;

export const INDEX_NAME = CONSTANTS.INDEX;
export const createIndexCall = createCall('INDEX');
export const INDEX = {
    STRUCT: <T extends { [k: string]: string }>(memberMap: T) => {
        const arg = `{${Object.entries(memberMap)
            .map(([k, v]) => `"${k}":${v}`)
            .join(',')}}` as StructString<T>;
        return fixComputedProperties(createIndexCall('STRUCT', arg));
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
    },
    INTERPOLATE: <S extends string[], T extends string[]>(strings: [...S], ...args: T) => {
        return createIndexCall(
            'INTERPOLATE',
            JSON.stringify(strings) as InterpolateString<S>,
            `[${args.join(',')}]` as InterpolateString<T, ''>
        );
    },
    INTERPOLATE_PROPERTY: <S extends string[], T extends string[]>(strings: [...S], ...args: T) => {
        const interp = createIndexCall(
            'INTERPOLATE',
            JSON.stringify(strings) as InterpolateString<S>,
            `[${args.join(',')}]` as InterpolateString<T, ''>
        );
        return `[${interp}]` as const;
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

export function fixComputedProperties<S extends string>(
    s: S
): String.Replace<String.Replace<S, '"[', '['>, ']":', ']:'> {
    return s.replaceAll(/"(\[.+?\])":/g, '$1:') as any;
}

export function createCall<T extends 'INDEX' | 'LIBRARY'>(where: T) {
    return <Call extends keyof typeof CONSTANTS, Args extends [...string[]]>(call: Call, ...args: Args) => {
        return `${(CONSTANTS as Pick<typeof CONSTANTS, T>)[where]}.${CONSTANTS[call]}(${
            (args ? args.join(',') : '') as String.Join<Args, ','>
        })` as const;
    };
}
