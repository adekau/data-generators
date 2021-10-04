import transformer from './transformer';
import { transformFile } from 'ts-transformer-testing-library';
import { CONSTANTS } from './constants';

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
                transforms: [(program) => transformer(program, {
                    DG_DEBUG_ENABLED: true,
                    DG_DEBUG_WIDTH: 4
                })]
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
        const never = () => transform('build<never>()');
        expect(never).toThrowError(
            "Unable to produce DataGenerator for 'never' type while attempting to build DataGenerator for type 'never' in file '/index.ts' line 0 character 33."
        );
    });

    it('should throw when calling build with no type argument', () => {
        const noTypeArgument = () => transform('build()');
        expect(noTypeArgument).toThrowError(
            "Expected type argument in build expression, but found none in file '/index.ts' line 0 character 33."
        );
    });

    it('should throw when a struct member reduces to never', () => {
        const type = '{ property1: string; property2: string & number; }';
        const structReducesToNever = () => transform(`build<${type}>();`);

        expect(structReducesToNever).toThrowError(
            `Unable to produce DataGenerator for 'never' type while attempting to build DataGenerator for type '${type}' in file '/index.ts' line 0 character 33.`
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
                    a: ${LIB}.string(),
                    b: ${LIB}.int()
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
        const neverArr = () => transform('build<never[]>()');
        expect(neverArr).toThrowError(
            "Unable to produce DataGenerator for 'never' type while attempting to build DataGenerator for type 'never[]' in file '/index.ts' line 0 character 33."
        );
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
                        type: ${INDEX}.constant("member1"),
                        property1: ${LIB}.int()
                    }),
                    ${INDEX}.struct({
                        type: ${INDEX}.constant("member2"),
                        property2: ${LIB}.string()
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
            str: ${LIB}.string()
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
                str: ${LIB}.string(),
                num: ${LIB}.int(),
                bool: ${LIB}.bool(),
                date: ${LIB}.date(),
                arr: ${INDEX}.array(${LIB}.string())
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

        const result2 = transform(`
        type Node<T> = { value: T; map: { next: Node<T>; prev: Node<T>; }; };
        build<Node<number>>();
        `);
        console.log(result2);
    });

    fit('should transform a generic type', () => {
        const result = transform(`
        type Container<T> = { value: T };
        type Value<T,G> = { type: T, type2: G };
        interface Dumb {
            bool: boolean;
        }
        build<Container<Value<Dumb, number>>>();
        `);

        console.log(result);
    });
});
