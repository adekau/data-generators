import transformer from './transformer';
import { transformFile } from 'ts-transformer-testing-library';

const INDEX = '__dg';
const LIB = '__dgLib';

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
    );
}
describe('Data Generators Compiler: Transformer', () => {
    it('should transform a string', () => {
        expect(transform('build<string>()')).toBe(`${LIB}.string();`);
    });

    it('should transform a number', () => {
        const result = transform('build<number>()');
        expect(result).toBe(`${LIB}.int();`);
    });

    it('should transform a boolean', () => {
        const result = transform('build<boolean>()');
        expect(result).toBe(`${LIB}.bool();`);
    });

    it('should transform any and unknown', () => {
        const result = transform('build<any>()');
        const result2 = transform('build<unknown>()');
        // Can't resonably determine a correct value to assign any/unknown, use undefined.
        // Could do something like anyOf(string(), number(), boolean(), ...etc) but without further feedback
        // I believe undefined is a safer default
        expect(result).toBe(`${INDEX}.constant(undefined);`);
        expect(result2).toBe(`${INDEX}.constant(undefined);`);
    });

    it('should throw when transforming never', () => {
        const never = transform('build<never>()');

        expect(never).toBe('__dg.constant(undefined);');
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
            });
            `)
        );
    });

    it('should transform a date', () => {
        const result = transform('build<Date>()');
        expect(result).toBe(`${LIB}.date();`);
    });

    it('should transform an empty array', () => {
        const result = transform('build<[]>()');
        expect(result).toBe(`${INDEX}.tuple();`);
    });

    it('should transform an array', () => {
        const result = transform('build<string[]>()');
        expect(result).toBe(`${INDEX}.array(${LIB}.string());`);
    });

    it('should transform an array of a more complex type', () => {
        const result = transform('build<({ a: string, b: number })[]>()');
        expect(result).toBe(
            singleLine(`
            ${INDEX}.array(
                ${INDEX}.struct({
                    "a": ${LIB}.string(),
                    "b": ${LIB}.int()
                })
            );
            `)
        );
    });

    it('should transform an array using the alias', () => {
        const result = transform('build<Array<string>>()');
        expect(result).toBe(`${INDEX}.array(${LIB}.string());`);
    });

    it('should throw when transforming an array of never', () => {
        const neverArr = transform('build<never[]>()');

        expect(neverArr).toBe('__dg.array(__dg.constant(undefined));');
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
                ${INDEX}.anyOf(
                    ${INDEX}.struct({
                        "type": ${INDEX}.constant("member1"),
                        "property1": ${LIB}.int()
                    }),
                    ${INDEX}.struct({
                        "type": ${INDEX}.constant("member2"),
                        "property2": ${LIB}.string()
                    })
                );
                `)
            )
        ).toBeTrue();
    });

    it('should transform a simple struct', () => {
        expect(transform('build<{ str: string }>()')).toBe(
            singleLine(`
        ${INDEX}.struct({
            "str": ${LIB}.string()
        });
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
            ${INDEX}.struct({
                "str": ${LIB}.string(),
                "num": ${LIB}.int(),
                "bool": ${LIB}.bool(),
                "date": ${LIB}.date(),
                "arr": ${INDEX}.array(${LIB}.string())
            });
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
                ${INDEX}.anyOf(
                    ${LIB}.string(),
                    ${LIB}.int(),
                    ${INDEX}.constant(false),
                    ${INDEX}.constant(true),
                    ${INDEX}.array(${INDEX}.constant(undefined))
                );
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
            ;${INDEX}.struct({
                "bool_Hello": ${INDEX}.constant("Hello_Hello_!")
            });
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
            ${INDEX}.struct({
                "t": ${LIB}.string(),
                "u": ${LIB}.int(),
                "v": ${INDEX}.array(${LIB}.bool())
            });
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
            ${INDEX}.struct({
                "t": ${LIB}.string()
            });
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
            ${INDEX}.struct({
                "t": ${INDEX}.anyOf(${LIB}.string(), ${LIB}.int())
            });
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
            ${INDEX}.struct({
                "t": ${INDEX}.constant("test")
            });
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
            ${INDEX}.struct({
                "key1": ${INDEX}.struct({
                    "prop": ${LIB}.string()
                }),
                "key2": ${INDEX}.anyOf(
                    ${INDEX}.struct({
                        "prop": ${LIB}.string()
                    }),
                    ${INDEX}.struct({
                        "prop": ${LIB}.string()
                    })
                ),
                "key3": ${INDEX}.struct({
                    "prop": ${LIB}.string()
                })
            });
            `)
        );
    });

    it('should map type from literal', () => {
        const result = transform(`
        type Q = { [Z in 'key1']: boolean };
        build<Q>();
        `);

        expect(result).toBe(singleLine(`${INDEX}.struct({ "key1": ${LIB}.bool() });`));
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
            singleLine(`
            ${INDEX}.struct({
                [${INDEX}.interpolate(["", "-Case:*"],[${LIB}.string()])]: ${LIB}.bool(),
                [${INDEX}.interpolate(["", "-Case:Create"],[${LIB}.string()])]: ${LIB}.bool(),
                [${INDEX}.interpolate(["", "-Case:Approve"],[${LIB}.string()])]: ${LIB}.bool(),
                [${INDEX}.interpolate(["", "-Arrest:*"],[${LIB}.string()])]: ${LIB}.bool(),
                [${INDEX}.interpolate(["", "-Arrest:Create"],[${LIB}.string()])]: ${LIB}.bool(),
                [${INDEX}.interpolate(["", "-Arrest:Approve"],[${LIB}.string()])]: ${LIB}.bool()
            });
            `)
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

        expect(result).toBe(singleLine(`
        ${INDEX}.struct({
            "body": ${LIB}.string(),
            "authorId": ${LIB}.string(),
            "attributes": ${LIB}.string()
        });
        `));
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

        expect(result).toBe(singleLine(`
        ${INDEX}.struct({
            "body": ${LIB}.string(),
            "authorId": ${LIB}.string(),
            "attributes": ${INDEX}.struct({
                "authorType": ${LIB}.int(),
                "additionalInfo": ${INDEX}.array(${LIB}.string())
            })
        });
        `));
    });
});
