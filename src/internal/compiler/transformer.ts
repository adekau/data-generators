import * as ts from 'typescript';
import { defaultDataGeneratorCompilerConfig, IDataGeneratorCompilerConfig } from './configure';
import { CONSTANTS } from './constants';
import factory = ts.factory;

type StringCoercible = { toString(): string } | undefined;
/**
 * More permanent alias for passing the result of ts.isIdentifier on CallExpression.Expression
 */
interface BuildNode extends ts.CallExpression {
    expression: ts.Identifier;
}

/**
 * Interface for a Symbol on a MappedType, ts does not export any type def for this
 */
interface MappedSymbol extends ts.Symbol {
    mappedType: ts.Type;
    nameType: ts.Type;
    keyType: ts.Type;
    syntheticOrigin: ts.Symbol;
}

/**
 * ts does not appear to export any interface for an ObjectType of kind ObjectFlags.Mapped
 */
interface MappedType extends ts.ObjectType {
    members: Map<string, MappedSymbol>;
}

declare global {
    interface Window {
        [CONSTANTS.DEBUG_WIDTH_ENV_VAR]?: number;
        [CONSTANTS.DEBUG_ENABLE_ENV_VAR]?: boolean;
    }
}

const transformationCache = new WeakMap<ts.Type, ts.Expression>();

/**
 * Transforms the TypeScript AST to search for the [[`build`]] method exported by the [[`index`]] module and
 * recursively transform the Type Parameter of [[`build`]] into a callable Data Generator.
 *
 * @param program The TypeScript program reference provided by a compiler. Gives the transformer access to type information.
 * @returns a transformed Abstract Syntax Tree (AST)
 */
const transformer =
    (
        program: ts.Program,
        config: IDataGeneratorCompilerConfig = defaultDataGeneratorCompilerConfig
    ): ts.TransformerFactory<ts.SourceFile> =>
    (context) => {
        return (sourceFile) => {
            const typeChecker = program.getTypeChecker();
            const defaultedConfig = Object.assign({}, defaultDataGeneratorCompilerConfig, config);

            // Don't have a lookahead in the AST for whether there are BuildNodes, need to append default
            // imports to each file checked.
            let hasAppendedDefaultImports = false;

            const visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
                if (ts.isImportDeclaration(node) && !hasAppendedDefaultImports) {
                    hasAppendedDefaultImports = true;
                    return appendDefaultImports(node);
                }

                if (isBuildNode(node, typeChecker)) {
                    return transformBuildNode(node, sourceFile, typeChecker, defaultedConfig);
                }

                return ts.visitEachChild(node, visitor, context);
            };

            return ts.visitNode(sourceFile, visitor);
        };
    };

/**
 * Takes a found build node and resolves the type argument and invokes transformation of the
 * type into a Data Generator
 */
function transformBuildNode(
    node: BuildNode,
    sourceFile: ts.SourceFile,
    typeChecker: ts.TypeChecker,
    config: Required<IDataGeneratorCompilerConfig>
): ts.Node {
    const typeArgument = node.typeArguments?.[0];
    let type: ts.Type;
    if (typeArgument) {
        type = typeChecker.getTypeFromTypeNode(typeArgument);
    } else {
        const { fileName } = sourceFile;
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        throw new Error(
            `Expected type argument in build expression, but found none in file '${fileName}' line ${line} character ${character}.`
        );
    }

    return transformType(type, node, sourceFile, typeChecker, config);
}

/**
 * Kicks off the recursive process of transforming a type to a Data Generator.
 */
function transformType(
    type: ts.Type,
    node: BuildNode,
    sourceFile: ts.SourceFile,
    typeChecker: ts.TypeChecker,
    config: Required<IDataGeneratorCompilerConfig>
): ts.Expression {
    const resolutionStack: ts.Type[] = [];
    const genericMap: WeakMap<ts.Symbol, ts.Expression> = new WeakMap();

    function _transformType(type: ts.Type): ts.Expression {
        debugTypeResolution('transforming type', type);
        if (resolutionStack.includes(type)) {
            console.warn(
                ...report(
                    `Detected recursive type while creating Data Generator for type '${node.typeArguments![0].getFullText()}'`,
                    type
                )
            );
            return createConstantUndefinedExpression();
        }
        resolutionStack.push(type);

        const cached = transformationCache.get(type);
        if (cached) {
            resolutionStack.pop();
            return cached;
        }

        // Check if there are function signatures
        const signatures = typeChecker.getSignaturesOfType(type, ts.SignatureKind.Call);
        let expression: ts.Expression;
        // If there are signatures, it's a function type.
        if (signatures.length) {
            debugTypeResolution('is function');
            expression = createLibraryCallExpression(CONSTANTS.FUNCTION, [
                _transformType(typeChecker.getReturnTypeOfSignature(signatures[0]))
            ]);
        } else {
            // If there are no signatures, the type needs to be branched further
            expression = resolveTypeExpression(type);
        }
        transformationCache.set(type, expression);
        resolutionStack.pop();
        return expression;
    }

    function debugTypeResolution(message: string, extra?: StringCoercible) {
        const prefix = resolutionStack
            .map(() =>
                Array.from({ length: config.DG_DEBUG_WIDTH })
                    .map(() => ' ')
                    .join('')
            )
            .join('');
        if (extra) {
            debug(`${prefix}- ${message}`, extra);
        } else {
            debug(`${prefix}- ${message}`);
        }
    }

    /**
     * Narrows the kind of a type based on its flags. From there it either returns an expression or continues narrowing
     * based on the refined type (object, union, intersection).
     */
    function resolveTypeExpression(type: ts.Type): ts.Expression {
        const { flags } = type;

        // unfortunately cannot use a switch statement here. For example "case ts.TypeFlags.Boolean" would never be true because
        // a boolean is also an object type.
        if (flags & ts.TypeFlags.Never) {
            const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
            const { fileName } = sourceFile;
            throw new Error(
                `Unable to produce DataGenerator for 'never' type while attempting to build DataGenerator for type '${node.typeArguments![0].getFullText()}' in file '${fileName}' line ${line} character ${character}.`
            );
        } else if (flags & ts.TypeFlags.VoidLike) {
            debugTypeResolution('is voidlike');
            return createIndexCallExpression(CONSTANTS.CONSTANT, [factory.createIdentifier('undefined')]);
        } else if (flags & ts.TypeFlags.Null) {
            debugTypeResolution('is null');
            return createIndexCallExpression(CONSTANTS.CONSTANT, [factory.createNull()]);
        } else if (flags & ts.TypeFlags.Literal) {
            debugTypeResolution('is literal');
            return createConstantCallExpression(type as ts.LiteralType);
        } else if (flags & (ts.TypeFlags.String | ts.TypeFlags.StringMapping)) {
            debugTypeResolution('is string');
            return createLibraryCallExpression(CONSTANTS.STRING);
        } else if (flags & ts.TypeFlags.Number) {
            debugTypeResolution('is number');
            return createLibraryCallExpression(CONSTANTS.NUMBER);
        } else if (flags & ts.TypeFlags.Boolean) {
            debugTypeResolution('is boolean');
            return createLibraryCallExpression(CONSTANTS.BOOLEAN);
        } else if (flags & ts.TypeFlags.Union) {
            debugTypeResolution('is union');
            return transformUnionType(type as ts.UnionType);
        } else if (flags & ts.TypeFlags.Intersection) {
            debugTypeResolution('is intersection');
            return transformIntersectionType(type as ts.IntersectionType);
        } else if (flags & ts.TypeFlags.TypeParameter) {
            debugTypeResolution('is type parameter');
            return genericMap.get(type.symbol) ?? factory.createIdentifier('__unresolvedGeneric');
        }
        // should always be the last else if, as a lot of primitive types are also object types.
        else if (flags & ts.TypeFlags.Object) {
            debugTypeResolution('is object');
            return transformObjectType(type as ts.ObjectType);
        }
        // fall through default of constant undefined.
        else {
            debugTypeResolution('is undefined (base resolve fallthrough)');
            return createConstantUndefinedExpression();
        }
    }

    /**
     * Further refine an object type. Generally Object types are going to result in struct generators,
     * the exception being tuple types which are also classified under the object type as a reference.
     */
    function transformObjectType(type: ts.ObjectType): ts.Expression {
        // first check if it's a Date
        if (
            type.symbol?.flags & (ts.SymbolFlags.Transient | ts.SymbolFlags.Interface) &&
            type.symbol.name.toLowerCase() === CONSTANTS.DATE
        ) {
            return createLibraryCallExpression(CONSTANTS.DATE);
        }

        if (type.aliasTypeArguments && type.aliasSymbol) {
            const decl: ts.Node | undefined = type.aliasSymbol.declarations?.[0];
            if (decl && ts.isTypeAliasDeclaration(decl)) {
                const paramSymbols = decl.typeParameters?.map((p: any) => p.symbol);
                const params = type.aliasTypeArguments.map((arg) => _transformType(arg));
                for (let i = 0; i < params.length; i++) {
                    if (paramSymbols?.[i]) {
                        genericMap.set(paramSymbols[i], params[i]);
                    }
                }
            }
        }

        const flags = type.objectFlags;
        if (flags & ts.ObjectFlags.Reference) {
            debugTypeResolution('is reference type');
            return transformTypeReference(type as ts.TypeReference);
        } else if (flags & ts.ObjectFlags.Mapped) {
            debugTypeResolution('is mapped type');
            return transformMappedType(type as MappedType);
        } else if (
            flags & (ts.ObjectFlags.Interface | ts.ObjectFlags.Class) ||
            type.symbol.flags & ts.SymbolFlags.TypeLiteral
        ) {
            debugTypeResolution('is interface/class');
            return createStructExpression(type);
        } else {
            // If none of the above, create an empty "struct({})"" generator. One such type that will reach this branch
            // is "{}".
            debugTypeResolution('is {} (object fallthrough)');
            return createIndexCallExpression(CONSTANTS.STRUCT, [factory.createObjectLiteralExpression([], false)]);
        }
    }

    /**
     * Type references refer to other already defined types. Both tuple types and array types are reference types.
     */
    function transformTypeReference(type: ts.TypeReference): ts.Expression {
        // Every flag here is going to include ObjectFlags.Reference, unset it to make the if statements easier to read.
        const flags = type.target.objectFlags & ~ts.ObjectFlags.Reference;

        if (type.typeArguments && type.symbol) {
            const decl: ts.Node | undefined = type.symbol.declarations?.[0];
            if (decl && ts.isTypeAliasDeclaration(decl)) {
                const paramSymbols = decl.typeParameters?.map((p: any) => p.symbol);
                const params = type.typeArguments.map((arg) => _transformType(arg));
                for (let i = 0; i < params.length; i++) {
                    if (paramSymbols?.[i]) {
                        genericMap.set(paramSymbols[i], params[i]);
                    }
                }
            }
        }

        if (flags & ts.ObjectFlags.Tuple) {
            debugTypeResolution('is tuple');
            return createIndexCallExpression(CONSTANTS.TUPLE, createTupleArguments(type as ts.TupleType));
        }
        // As far as I know Array<T> is the only type that resolves with ObjectFlags.Reference | ObjectFlags.Interface,
        // but to be safe also check that the symbol name is array
        else if (flags & ts.ObjectFlags.Interface && type.symbol?.name.toLowerCase() === 'array') {
            debugTypeResolution('is array');
            return createArrayExpression(type);
        } else {
            // Fall through case of creating a constant undefined generator.
            debugTypeResolution('is undefined (reference fallthrough)');
            return createConstantUndefinedExpression();
        }
    }

    /**
     * Union types are straight-forward, resolve each type in the union to a generator and pass those to anyOf
     */
    function transformUnionType(type: ts.UnionType): ts.Expression {
        const expressions = type.types.map((unionType) => _transformType(unionType));
        return createIndexCallExpression(CONSTANTS.ANY_OF, expressions);
    }

    /**
     * Intersection types are less straight forward. Non-overlapping types, e.g. (`string & number`) will reduce to `never`
     * before we get here, but in cases like `string & { someOtherProperty: number }` where it's valid but doesn't make
     * sense for a data generator to create something of this type, it will instead be ignored.
     *
     * Here intersection will act as concatenation of interfaces, such as `{ a: string } & { b: number }` will create a generator
     * of type `{ a: string, b: number }`, and `string & { someOtherProperty: number }` will ignore the left hand side and
     * create a generator of type `{ someOtherProperty: number }`.
     */
    function transformIntersectionType(type: ts.IntersectionType): ts.Expression {
        // Filters primitive types out. `string` is a javascript object, but is not an object type.
        const types = type.types.filter((t) => t.flags & ts.TypeFlags.Object);
        // Object symbols have members for their properties, will be using a new map to overwrite the original symbol's map.
        const propertyMap = new Map<string, ts.Symbol>();
        // map is faster than forEach
        types.map((t) => {
            t.symbol.members?.forEach((member) => {
                propertyMap.set(member.name, member);
            });
        });

        // return a struct expression using a custom property map that concatenates all of the members of each found object type
        return createStructExpression({
            ...type,
            symbol: {
                ...type.symbol,
                members: propertyMap as ts.SymbolTable
            }
        });
    }

    /**
     * Mapped types are a bit weird as they have members defined at the type level rather than the symbol level.
     * Their symbols also have extra properties that keep track of the original type, name type, key type, etc.
     * Otherwise, the process for transforming these is almost identical to transforming an intersection type.
     */
    function transformMappedType(type: MappedType): ts.Expression {
        const propertyMap = new Map<string, ts.Symbol>();

        type.members.forEach((sym) => {
            // The mapped symbol lacks a name property, use escapedName to fill in the gap.
            propertyMap.set(sym.escapedName.toString(), {
                ...sym,
                name: sym.escapedName.toString()
            });
        });

        return createStructExpression({
            ...type,
            symbol: {
                ...type.symbol,
                members: propertyMap as ts.SymbolTable
            }
        });
    }

    function createStructExpression(type: ts.Type): ts.Expression {
        return createIndexCallExpression(CONSTANTS.STRUCT, [createStructObjectLiteralExpression(type)]);
    }

    /**
     * Creates the argument to pass to struct().
     */
    function createStructObjectLiteralExpression(type: ts.Type): ts.Expression {
        const structMembers: ts.ObjectLiteralElementLike[] = [];

        // ts.SymbolTable has no map method. Use forEach and push to an array instead.
        type.symbol.members?.forEach((member) => {
            const typeOfMember = typeChecker.getTypeOfSymbolAtLocation(member, node);
            // Create syntax of the form "x: y" using the interface property name for x and the transformation of its type as y
            structMembers.push(factory.createPropertyAssignment(member.name, _transformType(typeOfMember)));
        });

        return factory.createObjectLiteralExpression(structMembers, false);
    }

    /**
     * Transform a type of form `x[]` to `array(build<x>())`.
     */
    function createArrayExpression(type: ts.TypeReference): ts.Expression {
        const typeArg = type.typeArguments?.[0];
        // in the case of an empty tuple type (`[]`).
        if (!typeArg) {
            return createIndexCallExpression(CONSTANTS.TUPLE);
        }
        // transform the type argument to a data generator to pass to the `array` creation function
        const transformed = _transformType(typeArg);
        return createIndexCallExpression(CONSTANTS.ARRAY, [transformed]);
    }

    function createTupleArguments(type: ts.TupleType): ts.Expression[] {
        return type.typeArguments?.map((typeArg) => _transformType(typeArg)) ?? [];
    }

    /**
     * Transforms literal types, (e.g. 'test', 5, false, etc) to constant('test'), constant(5), constant(false), etc.
     */
    function createConstantCallExpression(type: ts.LiteralType): ts.Expression {
        const { flags } = type;

        if (flags & ts.TypeFlags.NumberLiteral) {
            return createIndexCallExpression(CONSTANTS.CONSTANT, [factory.createNumericLiteral(type.value as number)]);
        } else if (flags & ts.TypeFlags.StringLiteral) {
            return createIndexCallExpression(CONSTANTS.CONSTANT, [factory.createStringLiteral(type.value as string)]);
        } else if (flags & ts.TypeFlags.BooleanLiteral) {
            // Boolean literal does not have a value, so instead need to go off the intrinsicName.
            return createIndexCallExpression(CONSTANTS.CONSTANT, [
                (type as any).intrinsicName === 'true' ? factory.createTrue() : factory.createFalse()
            ]);
        } else {
            // constant(undefined) as a fall through case
            return createConstantUndefinedExpression();
        }
    }

    function report(error: string, type: ts.Type): string[] {
        const { aliasSymbol, symbol } = type;
        const messages: string[] = [error];
        const decls: ts.Declaration[] = [];
        if (aliasSymbol?.declarations) {
            decls.push(...aliasSymbol.declarations);
        }
        if (symbol?.declarations) {
            decls.push(...symbol.declarations);
        }

        for (const decl of decls) {
            const { line } = sourceFile.getLineAndCharacterOfPosition(decl.getStart());
            messages.push(`
            \tat '${decl.getText()}'. ${sourceFile.fileName}:${line}
            `);
        }

        return messages;
    }

    function debug(...args: StringCoercible[]) {
        if (!config.DG_DEBUG_ENABLED) {
            return;
        }
        console.debug(...args);
    }

    return _transformType(type);
}

function createConstantUndefinedExpression(): ts.Expression {
    return createIndexCallExpression(CONSTANTS.CONSTANT, [factory.createIdentifier('undefined')]);
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

/**
 * Append "import *" declarations for every needed Data Generator module.
 */
function appendDefaultImports(host: ts.ImportDeclaration): ts.ImportDeclaration[] {
    return appendNamedImportNode(
        appendNamedImportNode(host, CONSTANTS.LIBRARY, CONSTANTS.LIBRARY_LOCATION),
        CONSTANTS.INDEX,
        CONSTANTS.INDEX_LOCATION
    );
}

/**
 * Transform an ImportDeclaration into an array of import declarations to tack on an extra import to an existing node.
 */
function appendNamedImportNode(
    host: ts.ImportDeclaration | ts.ImportDeclaration[],
    namespace: string,
    from: string
): ts.ImportDeclaration[] {
    return [
        // If the host is an existing array of import declarations, append the new one to the end.
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

/**
 * Checks a given node for if it's a call expression, is an identifier, and has the correct name.
 * Also makes sure that the node has a certain brand symbol on the type so that other identifiers with the same
 * name as the exported build method are not mistakenly transformed.
 */
function isBuildNode(node: ts.Node, typeChecker: ts.TypeChecker): node is BuildNode {
    if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.escapedText === CONSTANTS.BUILD_NODE_NAME
    ) {
        const type = typeChecker.getTypeAtLocation(node.expression);
        if (type.flags & ts.TypeFlags.Object) {
            const hasFunctionTypeId = !!type.symbol.members?.has(CONSTANTS.FUNCTION_TYPE_ID as ts.__String);
            const hasBrand = !!type.symbol.members?.has(CONSTANTS.DATA_GENERATOR_BUILDER_BRAND as ts.__String);
            return hasFunctionTypeId && hasBrand;
        } else {
            return false;
        }
    }
    return false;
}

export default transformer;
