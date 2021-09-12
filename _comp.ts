import * as ts from 'typescript';
import { struct } from './dist/cjs/internal/creation/struct';
import { apS } from './dist/cjs/internal/transformer/apply';
import { date, int, string } from './dist/cjs/library';
import { DataGenerator } from './dist/types/interfaces';

const libraryPrimitiveMap: Record<string, DataGenerator<unknown>> = {
    string: string(),
    number: int(),
    date: date()
};

function findInterfaces(file: string) {
    let program = ts.createProgram([file], { allowJs: true });
    const sourceFile = program.getSourceFile(file);
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const typechecker = program.getTypeChecker();

    ts.forEachChild(sourceFile, visit);

    function visit(node: ts.Node) {
        if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
            node.typeArguments.forEach((typeNode: ts.TypeNode) => {
                const type = typechecker.getTypeFromTypeNode(typeNode);
                let gen = struct({});
                type.getSymbol().members.forEach((symbol) => {
                    const test = typechecker.getTypeOfSymbolAtLocation(symbol, typeNode);
                    const symName = symbol.name;
                    const name = String(typeName(test)).toLowerCase();
                    if (Object.prototype.hasOwnProperty.call(libraryPrimitiveMap, name)) {
                        gen = gen.pipe(apS(symName, libraryPrimitiveMap[name]));
                    }
                });
                console.log(gen.create());
            });
        }
        node.forEachChild(visit);
    }
}

function typeName(type: ts.Type) {
    return type.symbol ? type.symbol.escapedName : (type as any).intrinsicName;
}

findInterfaces(process.argv[2]);
