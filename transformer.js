"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
var ts = require("typescript");
var factory = ts.factory;
;
var transformer = function (program) { return function (context) {
    return function (sourceFile) {
        var typeChecker = program.getTypeChecker();
        var hasAppendedDefaultImports = false;
        var visitor = function (node) {
            if (ts.isImportDeclaration(node) && !hasAppendedDefaultImports) {
                hasAppendedDefaultImports = true;
                return appendDefaultImports(node);
            }
            if (isBuildNode(node)) {
                return transformBuildNode(node, typeChecker);
            }
            return ts.visitEachChild(node, visitor, context);
        };
        return ts.visitNode(sourceFile, visitor);
    };
}; };
function transformBuildNode(node, typeChecker) {
    var typeArgument = node.typeArguments[0];
    var type = typeChecker.getTypeFromTypeNode(typeArgument);
    return transformType(type, node, typeChecker);
}
function transformType(type, node, typeChecker) {
    var _a;
    switch ((_a = type.symbol) === null || _a === void 0 ? void 0 : _a.flags) {
        case ts.SymbolFlags.Class:
        case ts.SymbolFlags.Interface:
        case ts.SymbolFlags.TypeLiteral:
            // console.log('interface | class | literal', type.symbol.name);
            // type.symbol.members.forEach((symbol) => console.log(symbol.name));
            // console.log('-----');
            return createStructNode(type, node, typeChecker);
        default:
            return createPrimitiveNode(type, node, typeChecker);
    }
}
function createStructNode(type, node, typeChecker) {
    return createIndexCallExpression("struct" /* STRUCT */, [createStructObjectLiteralExpression(type, node, typeChecker)]);
}
function createStructObjectLiteralExpression(type, node, typeChecker) {
    var structMembers = [];
    type.symbol.members.forEach(function (member) {
        var typeOfMember = typeChecker.getTypeOfSymbolAtLocation(member, node);
        structMembers.push(factory.createPropertyAssignment(member.name, transformType(typeOfMember, node, typeChecker)));
    });
    return factory.createObjectLiteralExpression(structMembers, false);
}
function createPrimitiveNode(type, node, typeChecker) {
    switch (type.flags) {
        case ts.TypeFlags.NumberLiteral:
            return createConstantCallExpression(type);
        case ts.TypeFlags.Number:
            return createLibraryCallExpression("int" /* NUMBER */);
        case ts.TypeFlags.String:
        case ts.TypeFlags.StringLiteral:
        case ts.TypeFlags.TemplateLiteral:
        case ts.TypeFlags.StringMapping:
            return createLibraryCallExpression("string" /* STRING */);
        case ts.TypeFlags.Object:
            if (type.symbol.flags & (ts.SymbolFlags.Transient | ts.SymbolFlags.Interface) && type.symbol.name.toLowerCase() === "date" /* DATE */) {
                return createLibraryCallExpression("date" /* DATE */);
            }
        default:
            return factory.createIdentifier('__primitive');
    }
}
function createConstantCallExpression(type) {
    switch (type.flags) {
        case ts.TypeFlags.NumberLiteral:
            return createIndexCallExpression("constant" /* CONSTANT */, [factory.createNumericLiteral(type.value)]);
        case ts.TypeFlags.StringLiteral:
            return createIndexCallExpression("constant" /* CONSTANT */, [factory.createStringLiteral(type.value)]);
        default:
            return createIndexCallExpression("constant" /* CONSTANT */, [factory.createIdentifier('undefined')]);
    }
}
function createIndexCallExpression(access, args) {
    if (args === void 0) { args = []; }
    return createSingleAccessCallExpression("__dg" /* INDEX */, access, args);
}
function createLibraryCallExpression(access, args) {
    if (args === void 0) { args = []; }
    return createSingleAccessCallExpression("__dgLib" /* LIBRARY */, access, args);
}
function createSingleAccessCallExpression(base, access, args) {
    if (args === void 0) { args = []; }
    return factory.createCallExpression(factory.createPropertyAccessExpression(factory.createIdentifier(base), factory.createIdentifier(access)), undefined, args);
}
function appendDefaultImports(host) {
    return appendNamedImportNode(appendNamedImportNode(host, '__dgLib', '@nwps/data-generators/library'), '__dg', '@nwps/data-generators');
}
function appendNamedImportNode(host, namespace, from) {
    return __spreadArray(__spreadArray([], (Array.isArray(host) ? host : [host])), [
        factory.createImportDeclaration(undefined, undefined, factory.createImportClause(false, undefined, factory.createNamespaceImport(factory.createIdentifier(namespace))), factory.createStringLiteral(from))
    ]);
}
function isBuildNode(node) {
    return ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.escapedText === "build" /* BUILD_NODE_NAME */;
}
exports["default"] = transformer;
