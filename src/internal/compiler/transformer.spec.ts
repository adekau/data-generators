import transformer from './transformer';
import { transformFile } from 'ts-transformer-testing-library';
import { fixComputedProperties, INDEX, LIB } from './helpers';

const INDEX_NAME = '__dg';
const LIB_NAME = '__dgLib';

function singleLine(code: string) {
    return code.split(/\r?\n/).join('').replace(/\s/g, '').trim();
}

function transform(code: string) {
    return singleLine(
        transformFile(
            { path: 'index.ts', contents: `import { build } from "./build"; ${code}` },
            {
                sources: [
                    {
                        path: './build.ts',
                        contents: 'export const build: { <T>() => any; _dataGeneratorBuilderBrand: any } = {} });'
                    }
                ],
                transforms: [
                    (program) =>
                        transformer(program, {
                            DG_DEBUG_ENABLED: false,
                            DG_DEBUG_WIDTH: 4
                        })
                ]
            }
        )
            .split(/\r?\n/)
            .slice(3)
            .join('')
    ).replace(/;$/, '');
}
describe('Data Generators Compiler: Transformer', () => {
    it('should transform a string', () => {
        expect(transform('build<string>()')).toBe(`${LIB_NAME}.string()`);
    });

    it('should transform a number', () => {
        const result = transform('build<number>()');
        expect(result).toBe(`${LIB_NAME}.int()`);
    });

    it('should transform a boolean', () => {
        const result = transform('build<boolean>()');
        expect(result).toBe(`${LIB_NAME}.bool()`);
    });

    it('should transform a function', () => {
        const result = transform('build<(a: string) => number>()');
        expect(result).toBe(LIB.FUNC(LIB.NUMBER));
    });

    it('should transform any and unknown', () => {
        const result = transform('build<any>()');
        const result2 = transform('build<unknown>()');
        // Can't resonably determine a correct value to assign any/unknown, use undefined.
        // Could do something like anyOf(string(), number(), boolean(), ...etc) but without further feedback
        // I believe undefined is a safer default
        expect(result).toBe(`${INDEX_NAME}.constant(undefined)`);
        expect(result2).toBe(`${INDEX_NAME}.constant(undefined)`);
    });

    it('should throw when transforming never', () => {
        const never = transform('build<never>()');

        expect(never).toBe('__dg.constant(undefined)');
    });

    it('should throw when calling build with no type argument', () => {
        const noTypeArgument = () => transform('build()');
        expect(noTypeArgument).toThrowError(
            "Expected type argument in build expression, but found none in file '/index.ts' line 0 character 33."
        );
    });

    it('should throw when a struct member reduces to never', () => {
        const type = '{ property1: string; property2: string & number; }';
        const structReducesToNever = transform(`build<${type}>();`);

        expect(structReducesToNever).toBe(
            singleLine(`
            __dg.struct({
                "property1": __dgLib.string(),
                "property2": __dg.constant(undefined)
            })
            `)
        );
    });

    it('should transform a date', () => {
        const result = transform('build<Date>()');
        expect(result).toBe(`${LIB_NAME}.date()`);
    });

    it('should transform an empty array', () => {
        const result = transform('build<[]>()');
        expect(result).toBe(`${INDEX_NAME}.tuple()`);
    });

    it('should transform a tuple', () => {
        const result = transform('build<[number, string, boolean]>()');
        expect(result).toBe(INDEX.TUPLE(LIB.NUMBER, LIB.STRING, LIB.BOOLEAN));
    });

    it('should transform an array', () => {
        const result = transform('build<string[]>()');
        expect(result).toBe(`${INDEX_NAME}.array(${LIB_NAME}.string())`);
    });

    it('should transform an array of a more complex type', () => {
        const result = transform('build<({ a: string, b: number })[]>()');
        expect(result).toBe(
            singleLine(`
            ${INDEX_NAME}.array(
                ${INDEX_NAME}.struct({
                    "a": ${LIB_NAME}.string(),
                    "b": ${LIB_NAME}.int()
                })
            )
            `)
        );
    });

    it('should transform an array using the alias', () => {
        const result = transform('build<Array<string>>()');
        expect(result).toBe(`${INDEX_NAME}.array(${LIB_NAME}.string())`);
    });

    it('should throw when transforming an array of never', () => {
        const neverArr = transform('build<never[]>()');

        expect(neverArr).toBe('__dg.array(__dg.constant(undefined))');
    });

    it('should transform a union disjoint on an enum property', () => {
        const result = transform(`
        enum TestEnum {
            Member1 = 'member1',
            Member2 = 'member2'
        }
        type Disjoint = { type: TestEnum.Member1, property1: number; } | { type: TestEnum.Member2, property2: string; };
        build<Disjoint>();
        `);

        expect(
            result.includes(
                singleLine(`
                ${INDEX_NAME}.anyOf(
                    ${INDEX_NAME}.struct({
                        "type": ${INDEX_NAME}.constant("member1"),
                        "property1": ${LIB_NAME}.int()
                    }),
                    ${INDEX_NAME}.struct({
                        "type": ${INDEX_NAME}.constant("member2"),
                        "property2": ${LIB_NAME}.string()
                    })
                )
                `)
            )
        ).toBeTrue();
    });

    it('should transform a simple struct', () => {
        expect(transform('build<{ str: string }>()')).toBe(
            singleLine(`
        ${INDEX_NAME}.struct({
            "str": ${LIB_NAME}.string()
        })
        `)
        );
    });

    it('should transform an interface', () => {
        const result = transform(`
        interface TestInterface {
            str: string;
            num: number;
            bool: boolean;
            date: Date;
            arr: string[];
        }
        build<TestInterface>();
        `);

        expect(
            result.includes(
                singleLine(`
            ${INDEX_NAME}.struct({
                "str": ${LIB_NAME}.string(),
                "num": ${LIB_NAME}.int(),
                "bool": ${LIB_NAME}.bool(),
                "date": ${LIB_NAME}.date(),
                "arr": ${INDEX_NAME}.array(${LIB_NAME}.string())
            })
            `)
            )
        ).toBeTrue();
    });

    it('should transform a self referencing type and convert the circular type to constant undefined', () => {
        const result = transform(`
        type IncompleteJsonObject = string | number | boolean | IncompleteJsonObject[];
        build<IncompleteJsonObject>();
        `);

        expect(
            result.includes(
                singleLine(`
                ${INDEX_NAME}.anyOf(
                    ${LIB_NAME}.string(),
                    ${LIB_NAME}.int(),
                    ${INDEX_NAME}.constant(false),
                    ${INDEX_NAME}.constant(true),
                    ${INDEX_NAME}.array(${INDEX_NAME}.constant(undefined))
                )
                `)
            )
        ).toBeTrue();
    });

    it('should transform a mapped generic type', () => {
        const result = transform(
            'interface Dumb { bool: boolean }; type Q<T extends string> = { [K in keyof Dumb as `${K}_${T}`]: `${T}_${T}_!`}; build<Q<`Hello`>>();'
        );

        expect(result).toBe(
            singleLine(`
            ;${INDEX_NAME}.struct({
                "bool_Hello": ${INDEX_NAME}.constant("Hello_Hello_!")
            })
            `)
        );
    });

    it('should transform multiple generic parameters', () => {
        const result = transform(`
        type Multiple<T, U, V> = { t: T, u: U, v: V };
        build<Multiple<string, number, boolean[]>>();
        `);

        expect(result).toBe(
            singleLine(`
            ${INDEX_NAME}.struct({
                "t": ${LIB_NAME}.string(),
                "u": ${LIB_NAME}.int(),
                "v": ${INDEX_NAME}.array(${LIB_NAME}.bool())
            })
            `)
        );
    });

    it('should transform default generics', () => {
        const result = transform(`
        type Df<T = string> = { t: T; };
        build<Df>();
        `);

        expect(result).toBe(
            singleLine(`
            ${INDEX_NAME}.struct({
                "t": ${LIB_NAME}.string()
            })
            `)
        );
    });

    it('should transform a more complex default generic', () => {
        const result = transform(`
        type Df<T = string | number> = { t: T; };
        build<Df>();
        `);

        expect(result).toBe(
            singleLine(`
            ${INDEX_NAME}.struct({
                "t": ${INDEX_NAME}.anyOf(${LIB_NAME}.string(), ${LIB_NAME}.int())
            })
            `)
        );
    });

    it('should transform overridden default generic', () => {
        const result = transform(`
        type Dfo<T extends string = never> = { t: T; };
        build<Dfo<'test'>>();
        `);

        expect(result).toBe(
            singleLine(`
            ${INDEX_NAME}.struct({
                "t": ${INDEX_NAME}.constant("test")
            })
            `)
        );
    });

    it('should map type from union', () => {
        const result = transform(`
            interface Tester { key1: string; key2: boolean; key3: number[]; }
            type Q = { [Z in keyof Tester]: Tester[Z] & { prop: string } };
            build<Q>();
        `);

        // key2 is anyOf because boolean is evaluated as the union of true and false, which distributes over the intersection
        expect(result).toBe(
            singleLine(`
            ${INDEX_NAME}.struct({
                "key1": ${INDEX_NAME}.struct({
                    "prop": ${LIB_NAME}.string()
                }),
                "key2": ${INDEX_NAME}.anyOf(
                    ${INDEX_NAME}.struct({
                        "prop": ${LIB_NAME}.string()
                    }),
                    ${INDEX_NAME}.struct({
                        "prop": ${LIB_NAME}.string()
                    })
                ),
                "key3": ${INDEX_NAME}.struct({
                    "prop": ${LIB_NAME}.string()
                })
            })
            `)
        );
    });

    it('should map type from literal', () => {
        const result = transform(`
        type Q = { [Z in 'key1']: boolean };
        build<Q>();
        `);

        expect(result).toBe(singleLine(`${INDEX_NAME}.struct({ "key1": ${LIB_NAME}.bool() })`));
    });

    it('should build structs with special characters in keys', () => {
        const result = transform(`
        type Part1 = string;
        type Part2 = 'Case' | 'Arrest';
        type Part3 = '*' | 'Create' | 'Approve';
        type Keys = \`\${Part1}-\${Part2}:\${Part3}\`;
        type Obj = { [K in Keys]: boolean };
        build<Obj>();
        `);

        expect(result).toBe(
            INDEX.STRUCT({
                [INDEX.INTERPOLATE_PROPERTY(['', '-Case:*'], LIB.STRING)]: LIB.BOOLEAN,
                [INDEX.INTERPOLATE_PROPERTY(['', '-Case:Create'], LIB.STRING)]: LIB.BOOLEAN,
                [INDEX.INTERPOLATE_PROPERTY(['', '-Case:Approve'], LIB.STRING)]: LIB.BOOLEAN,
                [INDEX.INTERPOLATE_PROPERTY(['', '-Arrest:*'], LIB.STRING)]: LIB.BOOLEAN,
                [INDEX.INTERPOLATE_PROPERTY(['', '-Arrest:Create'], LIB.STRING)]: LIB.BOOLEAN,
                [INDEX.INTERPOLATE_PROPERTY(['', '-Arrest:Approve'], LIB.STRING)]: LIB.BOOLEAN
            })
        );
    });

    it('should build a generic interface with multiple generic params', () => {
        const result = transform(`
        interface Comment<T = never> {
            body: string;
            authorId: string;
            attributes: T;
        }
        build<Comment<string>>();
        `);

        expect(result).toBe(
            INDEX.STRUCT({
                body: LIB.STRING,
                authorId: LIB.STRING,
                attributes: LIB.STRING
            })
        );
    });

    it('should build a generic interface with multiple generic params', () => {
        const result = transform(`
        interface Comment<T = never> {
            body: string;
            authorId: string;
            attributes: T;
        }
        interface CommentAttributes<T = never> {
            authorType: number;
            additionalInfo: T;
        }
        build<Comment<CommentAttributes<string[]>>>();
        `);

        expect(result).toBe(
            INDEX.STRUCT({
                body: LIB.STRING,
                authorId: LIB.STRING,
                attributes: INDEX.STRUCT({
                    authorType: LIB.NUMBER,
                    additionalInfo: INDEX.ARRAY(LIB.STRING)
                })
            })
        );
    });
});
