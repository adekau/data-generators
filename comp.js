"use strict";
exports.__esModule = true;
var ts = require("typescript");
var struct_1 = require("./dist/cjs/internal/creation/struct");
var apply_1 = require("./dist/cjs/internal/transformer/apply");
var library_1 = require("./dist/cjs/library");
var libraryPrimitiveMap = {
    string: library_1.string(),
    number: library_1.int(),
    date: library_1.date()
};
function findInterfaces(file) {
    var program = ts.createProgram([file], { allowJs: true });
    var sourceFile = program.getSourceFile(file);
    var printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    var typechecker = program.getTypeChecker();
    ts.forEachChild(sourceFile, visit);
    function visit(node) {
        if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
            (node.typeArguments.forEach(function (typeNode) {
                var type = typechecker.getTypeFromTypeNode(typeNode);
                var gen = struct_1.struct({});
                type.getSymbol().members.forEach(function (symbol) {
                    var test = typechecker.getTypeOfSymbolAtLocation(symbol, typeNode);
                    var symName = symbol.name;
                    var name = String(typeName(test)).toLowerCase();
                    if (Object.prototype.hasOwnProperty.call(libraryPrimitiveMap, name)) {
                        gen = gen.pipe(apply_1.apS(symName, libraryPrimitiveMap[name]));
                    }
                });
                console.log(gen.create());
            }));
        }
        node.forEachChild(visit);
    }
}
function typeName(type) {
    return type.symbol ? type.symbol.escapedName : type.intrinsicName;
}
findInterfaces(process.argv[2]);
