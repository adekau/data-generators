import ts from 'typescript';
import { sync as globSync } from 'glob';
import transform from './transformer';

const CJS_CONFIG: ts.CompilerOptions = {
    experimentalDecorators: true,
    jsx: ts.JsxEmit.React,
    module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.Node10,
    noEmitOnError: false,
    noUnusedLocals: true,
    noUnusedParameters: true,
    stripInternal: true,
    target: ts.ScriptTarget.ES2015,
    strict: true,
    ignoreDeprecations: '5.0'
};

export default function compile(input: string, options: ts.CompilerOptions = CJS_CONFIG) {
    const files = globSync(input);
    const compilerHost = ts.createCompilerHost(options);
    const program = ts.createProgram(files, options, compilerHost);

    const emitResult = program.emit(undefined, undefined, undefined, undefined, {
        before: [transform(program)]
    });

    const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

    allDiagnostics.forEach((diagnostic) => {
        let { line, character } = diagnostic.file?.getLineAndCharacterOfPosition(diagnostic.start ?? 0) ?? {};
        let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        console.log(`${diagnostic.file?.fileName} (${line ?? 0 + 1},${character ?? 0 + 1}): ${message}`);
    });
}
