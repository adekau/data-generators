import * as ts from 'typescript';
import factory = ts.factory;

interface BuildNode extends ts.CallExpression {
    expression: ts.Identifier;
}

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

function transformType(type: ts.Type, node: BuildNode, typeChecker: ts.TypeChecker): ts.Node {
    switch (type.symbol?.flags) {
        case ts.SymbolFlags.Class:
        case ts.SymbolFlags.Interface:
        case ts.SymbolFlags.TypeLiteral:
            console.log('interface | class | literal', type.symbol.name);
            type.symbol.members.forEach((symbol) => console.log(symbol.name));
            console.log('-----');
            return createStructNode(type, node, typeChecker);
        default:
            console.log('primitive', (type as any).intrinsicName);
            console.log('-----');
            return factory.createIdentifier('__primitive');
    }
}

function createStructNode(type: ts.Type, node: BuildNode, typeChecker: ts.TypeChecker): ts.Node {
    return factory.createCallExpression(
        factory.createPropertyAccessExpression(
            factory.createIdentifier("__dg"),
            factory.createIdentifier("struct")
        ),
        undefined,
        [createStructObjectLiteralExpression(type, node, typeChecker)]
    );
}

function createStructObjectLiteralExpression(type: ts.Type, node: BuildNode, typeChecker: ts.TypeChecker): ts.Expression {
    const structMembers: ts.ObjectLiteralElementLike[] = [];
    type.symbol.members.forEach((member) => {
        const typeOfMember = typeChecker.getTypeOfSymbolAtLocation(member, node);
        structMembers.push(
            factory.createPropertyAssignment(member.name, transformType(typeOfMember, node, typeChecker) as any)
        );
    });

    return factory.createObjectLiteralExpression(
        structMembers,
        false
    )
}

function appendDefaultImports(host: ts.ImportDeclaration): ts.ImportDeclaration[] {
    return appendNamedImportNode(appendNamedImportNode(host, '__dgLib', '@nwps/data-generators/library'), '__dg', '@nwps/data-generators');
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
    return ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.escapedText === 'build';
}

export default transformer;