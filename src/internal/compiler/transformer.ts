import * as ts from 'typescript';
import factory = ts.factory;
import * as lib from '../../library';
import * as dg from '../../index';

interface BuildNode extends ts.CallExpression {
    expression: ts.Identifier;
}

interface MappedSymbol extends ts.Symbol {
    mappedType: ts.Type;
    nameType: ts.Type;
    keyType: ts.Type;
    syntheticOrigin: ts.Symbol;
}

interface MappedType extends ts.ObjectType {
    members: Map<string, MappedSymbol>;
}

function nameOf<TName extends keyof typeof lib | keyof typeof dg>(name: TName) {
    return name;
}

const CONSTANTS = {
    BUILD_NODE_NAME: 'build' as const,
    INDEX: '__dg' as const,
    INDEX_LOCATION: '@nwps/data-generators' as const,
    LIBRARY: '__dgLib' as const,
    LIBRARY_LOCATION: '@nwps/data-generators/library' as const,
    FUNCTION_TYPE_ID: '__call' as const,
    STRUCT: nameOf('struct'),
    TUPLE: nameOf('tuple'),
    CONSTANT: nameOf('constant'),
    ARRAY: nameOf('array'),
    ANY_OF: nameOf('anyOf'),
    NUMBER: nameOf('int'),
    STRING: nameOf('string'),
    BOOLEAN: nameOf('bool'),
    FUNCTION: nameOf('func'),
    DATE: nameOf('date')
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
        };

        return ts.visitNode(sourceFile, visitor);
    };
};

function transformBuildNode(node: BuildNode, typeChecker: ts.TypeChecker): ts.Node {
    const typeArgument = node.typeArguments?.[0];
    let type: ts.Type;
    if (typeArgument) {
        type = typeChecker.getTypeFromTypeNode(typeArgument);
    } else {
        throw new Error('Expected type argument in build expression, but found none.');
    }

    return transformType(type, node, typeChecker);
}

function transformType(type: ts.Type, node: BuildNode, typeChecker: ts.TypeChecker): ts.Expression {
    // Check if there are function signatures
    const signatures = typeChecker.getSignaturesOfType(type, ts.SignatureKind.Call);

    // If there are signatures, it's a function type.
    if (signatures.length) {
        return createLibraryCallExpression(CONSTANTS.FUNCTION, [
            transformType(typeChecker.getReturnTypeOfSignature(signatures[0]), node, typeChecker)
        ]);
    } else {
        return createPrimitiveExpression(type, node, typeChecker);
    }
}

function createStructExpression(type: ts.Type, node: BuildNode, typeChecker: ts.TypeChecker): ts.Expression {
    return createIndexCallExpression(CONSTANTS.STRUCT, [createStructObjectLiteralExpression(type, node, typeChecker)]);
}

function createStructObjectLiteralExpression(
    type: ts.Type,
    node: BuildNode,
    typeChecker: ts.TypeChecker
): ts.Expression {
    const structMembers: ts.ObjectLiteralElementLike[] = [];

    type.symbol.members?.forEach((member) => {
        const typeOfMember = typeChecker.getTypeOfSymbolAtLocation(member, node);
        structMembers.push(
            factory.createPropertyAssignment(member.name, transformType(typeOfMember, node, typeChecker))
        );
    });

    return factory.createObjectLiteralExpression(structMembers, false);
}

function createPrimitiveExpression(type: ts.Type, node: BuildNode, typeChecker: ts.TypeChecker): ts.Expression {
    const { flags } = type;

    // unfortunately cannot use a switch statement here. For example "case ts.TypeFlags.Boolean" would never be true because
    // a boolean is also an object type.
    if (flags & ts.TypeFlags.Never) {
        throw new Error(
            `Unable to produce DataGenerator for 'never' type while attempting to build Data Generator for type '${node.typeArguments?.[0].getFullText()}'.`
        );
    } else if (flags & ts.TypeFlags.VoidLike) {
        return createIndexCallExpression(CONSTANTS.CONSTANT, [factory.createIdentifier('undefined')]);
    } else if (flags & ts.TypeFlags.Null) {
        return createIndexCallExpression(CONSTANTS.CONSTANT, [factory.createNull()]);
    } else if (flags & ts.TypeFlags.Literal) {
        return createConstantCallExpression(type as ts.LiteralType);
    } else if (flags & (ts.TypeFlags.String | ts.TypeFlags.StringMapping)) {
        return createLibraryCallExpression(CONSTANTS.STRING);
    } else if (flags & ts.TypeFlags.Number) {
        return createLibraryCallExpression(CONSTANTS.NUMBER);
    } else if (flags & ts.TypeFlags.Boolean) {
        return createLibraryCallExpression(CONSTANTS.BOOLEAN);
    } else if (flags & ts.TypeFlags.Union) {
        return transformUnionType(type as ts.UnionType, node, typeChecker);
    } else if (flags & ts.TypeFlags.Intersection) {
        return transformIntersectionType(type as ts.IntersectionType, node, typeChecker);
    }
    // should always be the last else if, as a lot of primitive types are also object types.
    else if (flags & ts.TypeFlags.Object) {
        return transformObjectType(type as ts.ObjectType, node, typeChecker);
    }
    // fall through default
    else {
        return createIndexCallExpression(CONSTANTS.CONSTANT, [factory.createIdentifier('undefined')]);
    }
}

function transformObjectType(type: ts.ObjectType, node: BuildNode, typeChecker: ts.TypeChecker): ts.Expression {
    // first check if it's a Date
    if (
        type.symbol?.flags & (ts.SymbolFlags.Transient | ts.SymbolFlags.Interface) &&
        type.symbol.name.toLowerCase() === CONSTANTS.DATE
    ) {
        return createLibraryCallExpression(CONSTANTS.DATE);
    }

    const flags = type.objectFlags;
    if (flags & ts.ObjectFlags.Reference) {
        return transformTypeReference(type as ts.TypeReference, node, typeChecker);
    } else if (flags & ts.ObjectFlags.Mapped) {
        return transformMappedType(type as MappedType, node, typeChecker);
    } else if (flags & (ts.ObjectFlags.Interface | ts.ObjectFlags.Class)) {
        return createStructExpression(type, node, typeChecker);
    } else {
        return createIndexCallExpression(CONSTANTS.STRUCT, [factory.createObjectLiteralExpression([], false)]);
    }
}

function transformTypeReference(type: ts.TypeReference, node: BuildNode, typeChecker: ts.TypeChecker): ts.Expression {
    const flags = type.target.objectFlags & ~ts.ObjectFlags.Reference;

    if (flags & ts.ObjectFlags.Tuple) {
        return createIndexCallExpression(
            CONSTANTS.TUPLE,
            createTupleArguments(type as ts.TupleType, node, typeChecker)
        );
    } else if (flags & ts.ObjectFlags.Interface && type.symbol?.name.toLowerCase() === 'array') {
        return createArrayExpression(type, node, typeChecker);
    } else {
        return createIndexCallExpression(CONSTANTS.CONSTANT, [factory.createIdentifier('undefined')]);
    }
}

function transformUnionType(type: ts.UnionType, node: BuildNode, typeChecker: ts.TypeChecker): ts.Expression {
    const expressions = type.types.map((unionType) => transformType(unionType, node, typeChecker));
    return createIndexCallExpression(CONSTANTS.ANY_OF, expressions);
}

function transformIntersectionType(
    type: ts.IntersectionType,
    node: BuildNode,
    typeChecker: ts.TypeChecker
): ts.Expression {
    const types = type.types.filter((t) => t.flags & ts.TypeFlags.Object);
    const propertyMap = new Map<string, ts.Symbol>();
    types.map((t) => {
        t.symbol.members?.forEach((member) => {
            propertyMap.set(member.name, member);
        });
    });

    return createStructExpression(
        {
            ...type,
            symbol: {
                ...type.symbol,
                members: propertyMap as ts.SymbolTable
            }
        },
        node,
        typeChecker
    );
}

function transformMappedType(type: MappedType, node: BuildNode, typeChecker: ts.TypeChecker): ts.Expression {
    const propertyMap = new Map<string, ts.Symbol>();

    type.members.forEach((sym) => {
        propertyMap.set(sym.escapedName.toString(), {
            ...sym,
            name: sym.escapedName.toString()
        });
    });

    return createStructExpression(
        {
            ...type,
            symbol: {
                ...type.symbol,
                members: propertyMap as ts.SymbolTable
            }
        },
        node,
        typeChecker
    );
}

function createArrayExpression(type: ts.TypeReference, node: BuildNode, typeChecker: ts.TypeChecker): ts.Expression {
    const typeArg = type.typeArguments?.[0];
    if (!typeArg) {
        return createIndexCallExpression(CONSTANTS.TUPLE);
    }
    const transformed = transformType(typeArg, node, typeChecker);
    return createIndexCallExpression(CONSTANTS.ARRAY, [transformed]);
}

function createTupleArguments(type: ts.TupleType, node: BuildNode, typeChecker: ts.TypeChecker): ts.Expression[] {
    return type.typeArguments?.map((typeArg) => transformType(typeArg, node, typeChecker)) ?? [];
}

function createConstantCallExpression(type: ts.LiteralType): ts.Expression {
    const { flags } = type;
    if (flags & ts.TypeFlags.NumberLiteral) {
        return createIndexCallExpression(CONSTANTS.CONSTANT, [factory.createNumericLiteral(type.value as number)]);
    } else if (flags & ts.TypeFlags.StringLiteral) {
        return createIndexCallExpression(CONSTANTS.CONSTANT, [factory.createStringLiteral(type.value as string)]);
    } else if (flags & ts.TypeFlags.BooleanLiteral) {
        return createIndexCallExpression(CONSTANTS.CONSTANT, [
            (type as any).intrinsicName === 'true' ? factory.createTrue() : factory.createFalse()
        ]);
    } else {
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
        factory.createPropertyAccessExpression(factory.createIdentifier(base), factory.createIdentifier(access)),
        undefined,
        args
    );
}

function appendDefaultImports(host: ts.ImportDeclaration): ts.ImportDeclaration[] {
    return appendNamedImportNode(
        appendNamedImportNode(host, CONSTANTS.LIBRARY, CONSTANTS.LIBRARY_LOCATION),
        CONSTANTS.INDEX,
        CONSTANTS.INDEX_LOCATION
    );
}

function appendNamedImportNode(
    host: ts.ImportDeclaration | ts.ImportDeclaration[],
    namespace: string,
    from: string
): ts.ImportDeclaration[] {
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
    return (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.escapedText === CONSTANTS.BUILD_NODE_NAME
    );
}

export default transformer;
