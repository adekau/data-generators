import * as ts from 'typescript';
import factory = ts.factory;

interface BuildNode extends ts.CallExpression {
    expression: ts.Identifier;
}

const enum CONSTANTS {
    BUILD_NODE_NAME = 'build',
    INDEX = '__dg',
    LIBRARY = '__dgLib',
    STRUCT = 'struct',
    TUPLE = 'tuple',
    CONSTANT = 'constant',
    NUMBER = 'int',
    STRING = 'string',
    DATE = 'date'
};

const transformer: (program: ts.Program) => ts.TransformerFactory<ts.SourceFile> = (program) => (context) => {
    return (sourceFile) => {
        const typeChecker = program.getTypeChecker();
        let hasAppendedDefaultImports = false;

        const visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
            if (ts.isImportDeclaration(node) && !hasAppendedDefaultImports) {
                hasAppendedDefaultImports = true;
                return appendDefaultImports(node);
            }

            if (isBuildNode(node)) {
                return transformBuildNode(node, typeChecker);
            }

            return ts.visitEachChild(node, visitor, context);
        }

        return ts.visitNode(sourceFile, visitor);
    }
}

function transformBuildNode(node: BuildNode, typeChecker: ts.TypeChecker): ts.Node {
    const typeArgument = node.typeArguments[0];
    const type = typeChecker.getTypeFromTypeNode(typeArgument);

    return transformType(type, node, typeChecker);
}

function transformType(type: ts.Type, node: BuildNode, typeChecker: ts.TypeChecker): ts.Expression {
    switch (type.symbol?.flags) {
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

function createStructNode(type: ts.Type, node: BuildNode, typeChecker: ts.TypeChecker): ts.Expression {
    return createIndexCallExpression(CONSTANTS.STRUCT, [createStructObjectLiteralExpression(type, node, typeChecker)]);
}

function createStructObjectLiteralExpression(type: ts.Type, node: BuildNode, typeChecker: ts.TypeChecker): ts.Expression {
    const structMembers: ts.ObjectLiteralElementLike[] = [];

    type.symbol.members.forEach((member) => {
        const typeOfMember = typeChecker.getTypeOfSymbolAtLocation(member, node);
        structMembers.push(
            factory.createPropertyAssignment(member.name, transformType(typeOfMember, node, typeChecker))
        );
    });

    return factory.createObjectLiteralExpression(
        structMembers,
        false
    )
}

function createPrimitiveNode(type: ts.Type, node: BuildNode, typeChecker: ts.TypeChecker): ts.Expression {
    switch (type.flags) {
        case ts.TypeFlags.NumberLiteral:
            return createConstantCallExpression(type as ts.LiteralType);
        case ts.TypeFlags.Number:
            return createLibraryCallExpression(CONSTANTS.NUMBER);
        case ts.TypeFlags.String:
        case ts.TypeFlags.StringLiteral:
        case ts.TypeFlags.TemplateLiteral:
        case ts.TypeFlags.StringMapping:
            return createLibraryCallExpression(CONSTANTS.STRING);
        case ts.TypeFlags.Object:
            if (type.symbol.flags & (ts.SymbolFlags.Transient | ts.SymbolFlags.Interface) && type.symbol.name.toLowerCase() === CONSTANTS.DATE) {
                return createLibraryCallExpression(CONSTANTS.DATE);
            }
        default:
            return factory.createIdentifier('__primitive');
    }
}

function createConstantCallExpression(type: ts.LiteralType): ts.Expression {
    switch (type.flags) {
        case ts.TypeFlags.NumberLiteral:
            return createIndexCallExpression(CONSTANTS.CONSTANT, [factory.createNumericLiteral(type.value as number)]);
        case ts.TypeFlags.StringLiteral:
            return createIndexCallExpression(CONSTANTS.CONSTANT, [factory.createStringLiteral(type.value as string)]);
        default:
            return createIndexCallExpression(CONSTANTS.CONSTANT, [factory.createIdentifier('undefined')]);
    }
}

function createIndexCallExpression(access: string, args: ts.Expression[] = []): ts.Expression {
    return createSingleAccessCallExpression(CONSTANTS.INDEX, access, args);
}

function createLibraryCallExpression(access: string, args: ts.Expression[] = []): ts.Expression {
    return createSingleAccessCallExpression(CONSTANTS.LIBRARY, access, args);
}

function createSingleAccessCallExpression(base: string, access: string, args: ts.Expression[] = []): ts.Expression {
    return factory.createCallExpression(
        factory.createPropertyAccessExpression(
            factory.createIdentifier(base),
            factory.createIdentifier(access)
        ),
        undefined,
        args
    );
}

function appendDefaultImports(host: ts.ImportDeclaration): ts.ImportDeclaration[] {
    return appendNamedImportNode(
        appendNamedImportNode(host, '__dgLib', '@nwps/data-generators/library'), '__dg', '@nwps/data-generators'
    );
}

function appendNamedImportNode(host: ts.ImportDeclaration | ts.ImportDeclaration[], namespace: string, from: string): ts.ImportDeclaration[] {
    return [
        ...(Array.isArray(host) ? host : [host]),
        factory.createImportDeclaration(
            undefined,
            undefined,
            factory.createImportClause(
                false,
                undefined,
                factory.createNamespaceImport(factory.createIdentifier(namespace))
            ),
            factory.createStringLiteral(from)
        )
    ];
}

function isBuildNode(node: ts.Node): node is BuildNode {
    return ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.escapedText === CONSTANTS.BUILD_NODE_NAME;
}

export default transformer;