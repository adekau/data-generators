import transformer from './transformer';
import { transformFile } from 'ts-transformer-testing-library';

const INDEX = '__dg';
const LIB = '__dgLib';

function singleLine(code: string) {
    return code.split(/\r?\n/).join('').replace(/\s/g, '').trim();
}

function transform(code: string) {
    return singleLine(transformFile({ path: 'index.ts', contents: `import { build } from "./build"; ${code}` }, {
        sources: [{
            path: './build.ts',
            contents: 'export const build: { <T>() => any; _dataGeneratorBuilderBrand: any } = {} });'
        }],
        transforms: [transformer]
    }).split(/\r?\n/).slice(3).join(''));
}
describe('Data Generators Compiler: Transformer', () => {
    it('should transform a string', () => {
        expect(transform('build<string>()')).toBe(`${LIB}.string();`);
    });

    it('should transform a simple struct', () => {
        expect(transform('build<{ str: string }>()')).toBe(singleLine(`
        ${INDEX}.struct({
            str: ${LIB}.string()
        });
        `));
    });
});