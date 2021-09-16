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
                transforms: [transformer]
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

    it('should transform a simple struct', () => {
        expect(transform('build<{ str: string }>()')).toBe(
            singleLine(`
        ${INDEX}.struct({
            str: ${LIB}.string()
        });
        `)
        );
    });
});
