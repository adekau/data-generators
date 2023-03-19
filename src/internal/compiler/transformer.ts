import ts from 'typescript';
import * as Index from '../../index';
import * as Library from '../../library';
import { defaultDataGeneratorCompilerConfig, IDataGeneratorCompilerConfig } from './configure';
import { CONSTANTS } from './constants';

/**
 * Any type that can be coerced to a string. Used for debugging in the [[debug]] function.
 */
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
    declaration?: ts.Declaration;
    typeParameter?: ts.TypeParameter;
}

/**
 * Keeps track of already resolved types to their resolved expressions to improve performance.
 * Will not get in the way of GC due to the use of a WeakMap.
 */
const transformationCache = new WeakMap<ts.Type, ts.Expression>();

/**
 * Returns a function that will transform a source file based on the context and config.
 *
 * @param program The TypeScript program reference provided by a compiler. Gives the transformer access to type information.
 * @param context the typescript transformation context
 * @param config semble-ts specific configuration
 * @returns
 */
const getTransformSourceFileFunction: (
    program: ts.Program,
    context: ts.TransformationContext,
    config: IDataGeneratorCompilerConfig
) => ts.Transformer<ts.SourceFile> = (program, context, config) => (sourceFile: ts.SourceFile) => {
    const typeChecker = program.getTypeChecker();
    const defaultedConfig = Object.assign({}, defaultDataGeneratorCompilerConfig, config);

    // Don't have a lookahead in the AST for whether there are BuildNodes, need to append default
    // imports to each file checked.
    let hasAppendedDefaultImports = false;

    const visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
        if (ts.isImportDeclaration(node) && !hasAppendedDefaultImports) {
            hasAppendedDefaultImports = true;
            return appendDefaultImports(context.factory, node);
        }

        if (isBuildNode(node, typeChecker)) {
            return transformBuildNode(node, sourceFile, typeChecker, context, defaultedConfig);
        }

        return ts.visitEachChild(node, visitor, context);
    };

    return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
};

/**
 * Transforms the TypeScript AST to search for the [[`build`]] method exported by the [[`index`]] module and
 * recursively transform the Type Parameter of [[`build`]] into a callable Data Generator.
 *
 * @param program The TypeScript program reference provided by a compiler. Gives the transformer access to type information.
 * @param config semble-ts specific configuration
 * @returns a transformed Abstract Syntax Tree (AST)
 */
const transformer =
    (
        program: ts.Program,
        config: IDataGeneratorCompilerConfig = defaultDataGeneratorCompilerConfig
    ): ts.CustomTransformerFactory =>
    (context) => {
        return {
            transformSourceFile: getTransformSourceFileFunction(program, context, config),
            transformBundle(bundleNode) {
                const files = bundleNode.sourceFiles;
                return context.factory.updateBundle(
                    bundleNode,
                    files.map((sourceFile) => this.transformSourceFile(sourceFile))
                );
            }
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
    context: ts.TransformationContext,
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

    return transformType(type, node, sourceFile, typeChecker, context, config);
}

/**
 * Kicks off the recursive process of transforming a type to a Data Generator.
 */
function transformType(
    type: ts.Type,
    node: BuildNode,
    sourceFile: ts.SourceFile,
    typeChecker: ts.TypeChecker,
    context: ts.TransformationContext,
    config: Required<IDataGeneratorCompilerConfig>
): ts.Expression {
    const factory = context.factory;
    /**
     * Keeps track of a stack of resolved types to enable detection of recursive or self-referencing types.
     */
    const resolutionStack: ts.Type[] = [];
    /**
     * A WeakMap (to not get in the way of GC) of generic symbols to their resolved expressions.
     * A symbol here might look like 'T' for a generic type alias.
     * Can keep track of multiple generic symbols with the same name, for instance two different types parameterized by T
     * due to being a map on the symbol's reference, which will be different for each since positions of the symbols will differ.
     */
    const genericMap: WeakMap<ts.Symbol, ts.Expression> = new WeakMap();

    /**
     * Enables the recursive type resolution and keeps track of type-specific scoped information such as resolved types
     * and generics.
     */
    function _transformType(type: ts.Type): ts.Expression {
        debugTypeResolution(`Transforming type (${(type.symbol?.name || type.aliasSymbol?.name) ?? 'no name'})`, type);
        if (resolutionStack.includes(type)) {
            console.warn(
                ...report(
                    `Detected recursive type while creating Data Generator for type '${node.typeArguments![0].getFullText()}'`,
                    type
                )
            );
            return createConstantUndefinedExpression(factory);
        }
        resolutionStack.push(type);

        const cached = transformationCache.get(type);
        if (cached) {
            debugTypeResolution(`resolved from cache (kind : ${ts.SyntaxKind[cached.kind]})`);
            resolutionStack.pop();
            return cached;
        }

        // Check if there are function signatures
        const signatures = typeChecker.getSignaturesOfType(type, ts.SignatureKind.Call);
        let expression: ts.Expression;
        // If there are signatures, it's a function type.
        if (signatures.length) {
            debugTypeResolution('is function');
            expression = createLibraryCallExpression(factory, CONSTANTS.FUNCTION, [
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

    /***********************************************************
     * KICK OFF TYPE RESOLUTION
     * ********************************************************/

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

            console.warn(
                ...report(
                    `Unable to produce DataGenerator for 'never' type while attempting to build DataGenerator for type '${node.typeArguments![0].getFullText()}' in file '${fileName}' line ${line} character ${character}.`,
                    type
                )
            );

            return createConstantUndefinedExpression(factory);

            /* Void / Undefined */
        } else if (flags & ts.TypeFlags.VoidLike) {
            debugTypeResolution('is voidlike');
            return createConstantUndefinedExpression(factory);

            /* Null */
        } else if (flags & ts.TypeFlags.Null) {
            debugTypeResolution('is null');
            return createIndexCallExpression(factory, CONSTANTS.CONSTANT, [factory.createNull()]);

            /* Literal types, e.g. 'Hello', 5, true, etc */
        } else if (flags & ts.TypeFlags.Literal) {
            debugTypeResolution('is literal');
            return createConstantCallExpression(type as ts.LiteralType);

            /** Template Literal */
        } else if (flags & ts.TypeFlags.TemplateLiteral) {
            debugTypeResolution('is template literal');
            return createTemplateLiteralExpression(type as ts.TemplateLiteralType);

            /* String or `${StringLike}` */
        } else if (flags & (ts.TypeFlags.String | ts.TypeFlags.StringMapping)) {
            debugTypeResolution('is string');
            return createLibraryCallExpression(factory, CONSTANTS.STRING);

            /* Number */
        } else if (flags & ts.TypeFlags.Number) {
            debugTypeResolution('is number');
            return createLibraryCallExpression(factory, CONSTANTS.NUMBER);

            /* Boolean */
        } else if (flags & ts.TypeFlags.Boolean) {
            debugTypeResolution('is boolean');
            return createLibraryCallExpression(factory, CONSTANTS.BOOLEAN);

            /* Unions, e.g. `string | number` */
        } else if (flags & ts.TypeFlags.Union) {
            debugTypeResolution('is union');
            return transformUnionType(type as ts.UnionType);

            /* Intersections, e.g. `{ a: string; } & { b: number; }` */
        } else if (flags & ts.TypeFlags.Intersection) {
            debugTypeResolution('is intersection');
            return transformIntersectionType(type as ts.IntersectionType);

            /* Type Parameters, e.g. T in `func<T>()` */
        } else if (flags & ts.TypeFlags.TypeParameter) {
            debugTypeResolution('is type parameter');
            return genericMap.get(type.symbol) ?? factory.createIdentifier('__unresolvedGeneric');
        }

        /* Objects, e.g. class/interface/literals ( { a: string } ) */
        // should always be the last else if, as a lot of primitive types are also object types.
        else if (flags & ts.TypeFlags.Object) {
            debugTypeResolution('is object');
            return transformObjectType(type as ts.ObjectType);
        }

        /* Anything else */
        // fall through default of constant undefined.
        else {
            debugTypeResolution('is undefined (base resolve fallthrough)', `flags: ${flags}`);
            return createConstantUndefinedExpression(factory);
        }
    }

    /***********************************************************
     * TYPE TRANSFORMATIONS
     **********************************************************/

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
            debugTypeResolution('is date');
            return createLibraryCallExpression(factory, CONSTANTS.DATE);
        }

        transformGenericArguments(type.aliasTypeArguments, type.aliasSymbol);

        const flags = type.objectFlags;

        /* References, e.g. Array, Map, etc */
        if (flags & ts.ObjectFlags.Reference) {
            debugTypeResolution('is reference type');
            return transformTypeReference(type as ts.TypeReference);

            /* Mapped types, e.g. `type Nullable<T extends Record<any, any>> = { [K in keyof T]+?: T[K] | null; }` */
        } else if (flags & ts.ObjectFlags.Mapped) {
            debugTypeResolution('is mapped type');
            return transformMappedType(type as MappedType);

            /* Interface or Class or Literal, e.g. `{ a: string }` */
        } else if (
            flags & (ts.ObjectFlags.Interface | ts.ObjectFlags.Class) ||
            type.symbol.flags & ts.SymbolFlags.TypeLiteral
        ) {
            debugTypeResolution('is interface/class');
            return createStructExpression(type);

            /* Anything else */
        } else {
            // If none of the above, create an empty "struct({})"" generator. One such type that will reach this branch
            // is "{}".
            debugTypeResolution('is {} (object fallthrough)', `flags: ${flags}`);
            return createIndexCallExpression(factory, CONSTANTS.STRUCT, [
                factory.createObjectLiteralExpression([], false)
            ]);
        }
    }

    /**
     * Type references refer to other already defined types. Both tuple types and array types are reference types.
     */
    function transformTypeReference(type: ts.TypeReference): ts.Expression {
        // Every flag here is going to include ObjectFlags.Reference, unset it to make the if statements easier to read.
        const flags = type.target.objectFlags & ~ts.ObjectFlags.Reference;

        transformGenericArguments(type.typeArguments, type.symbol);

        // Tuple type, e.g. [number, 'hello', 5, false]
        if (flags & ts.ObjectFlags.Tuple) {
            debugTypeResolution('is tuple');
            return createIndexCallExpression(factory, CONSTANTS.TUPLE, createTupleArguments(type as ts.TupleType));
        }
        // special case for Array<T>, which is a reference type (to class Array). Like Map, but has a syntax literal (`[]`)
        else if (type.symbol.escapedName.toString().toLowerCase() === 'array') {
            debugTypeResolution('is array');
            return createArrayExpression(type);

            /* Interface or Class */
        } else if (flags & (ts.ObjectFlags.Interface | ts.ObjectFlags.Class)) {
            debugTypeResolution('is interface/class');
            return createStructExpression(type);
        } else {
            // Fall through case of creating a constant undefined generator.
            debugTypeResolution('is undefined (reference fallthrough)', `flags: ${flags}`);
            return createConstantUndefinedExpression(factory);
        }
    }

    /**
     * Union types are straight-forward, resolve each type in the union to a generator and pass those to anyOf
     */
    function transformUnionType(type: ts.UnionType): ts.Expression {
        const expressions = type.types.map((unionType) => _transformType(unionType));
        return createIndexCallExpression(factory, CONSTANTS.ANY_OF, expressions);
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
        const types = type.types.filter(
            (t) => t.flags & ts.TypeFlags.Object && !((t as ts.ObjectType).objectFlags & ts.ObjectFlags.Reference)
        );
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
     * Further refine a mapped object type, members can be finite or infinite in quantity.
     * Handle both possibilities.
     */
    function transformMappedType(type: MappedType): ts.Expression {
        /** Finite members */
        if (type.getProperties().length) {
            debugTypeResolution('is mapped type with properties');
            return transformMappedTypeWithMembers(type);

            /** Potentially infinite members (index type) */
        } else if (typeChecker.getIndexInfosOfType(type).length) {
            debugTypeResolution('is index mapped type');
            return transformIndexMappedType(type);

            /** Fall-through case, generate `constant(undefined)`. */
        } else {
            debugTypeResolution('mapped type fall-through (undefined)');
            return createConstantUndefinedExpression(factory);
        }
    }

    /**
     * Index mapped types don't have finite statically defined constant members.
     * Given that a struct data generator is going to want to have finite members, generate one struct property
     * per index type.
     */
    function transformIndexMappedType(type: MappedType): ts.Expression {
        const exprs = typeChecker
            .getIndexInfosOfType(type)
            .map((info) => [_transformType(info.keyType), _transformType(info.type)]);
        const propertyAssignments = exprs.map(([key, base]) =>
            factory.createPropertyAssignment(factory.createComputedPropertyName(key), base)
        );

        return createIndexCallExpression(factory, 'struct', [
            factory.createObjectLiteralExpression(propertyAssignments, false)
        ]);
    }

    /**
     * Mapped types are a bit weird as they have members defined at the type level rather than the symbol level.
     * Their symbols also have extra properties that keep track of the original type, name type, key type, etc.
     * Otherwise, the process for transforming these is almost identical to transforming an intersection type.
     */
    function transformMappedTypeWithMembers(type: MappedType): ts.Expression {
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

    /**
     * Takes type arguments of an Object type or Reference type and resolves the generic type arguments and stores
     * the resulting expressions into the genericMap for use later. When _transformType encounters a type parameter
     * such as { someProperty: T }, the stored value in genericMap from here will be used to replace T with the
     * resolved expression.
     */
    function transformGenericArguments(typeArguments: readonly ts.Type[] | undefined, symbol: ts.Symbol | undefined) {
        if (typeArguments && symbol) {
            const decl: ts.Node | undefined = symbol.declarations?.[0];
            if (!decl) {
                debugTypeResolution(`No type parameters to transform for ${symbol?.name ?? 'no name'}`);
                return;
            }
            const paramSymbols = typeChecker.getSymbolsInScope(decl, ts.SymbolFlags.TypeParameter);
            debugTypeResolution(`Transforming type parameters (${symbol?.name ?? 'no name'})`);
            const params = typeArguments.map((arg) => _transformType(arg));
            for (let i = 0; i < params.length; i++) {
                if (paramSymbols?.[i]) {
                    genericMap.set(paramSymbols[i], params[i]);
                }
            }
        }
    }

    /***********************************************************
     * EXPRESSION CREATION FUNCTIONS
     * ********************************************************/

    /**
     * Creates a struct() expression for an object type.
     */
    function createStructExpression(type: ts.Type): ts.Expression {
        return createIndexCallExpression(factory, CONSTANTS.STRUCT, [createStructObjectLiteralExpression(type)]);
    }

    /**
     * Creates the argument to pass to struct().
     */
    function createStructObjectLiteralExpression(type: ts.Type): ts.Expression {
        const symbolMembers: ts.Symbol[] = type.symbol.members ? Array.from(type.symbol.members.values() as any) : [];
        // filter out type parameters, e.g. "T"
        const symbolMembersToTransform = symbolMembers.filter(
            (member) => !(member.flags & ts.SymbolFlags.TypeParameter)
        );

        debugTypeResolution('symbol members to transform:', symbolMembersToTransform);

        // create property nodes for filtered symbols
        const structMembers: ts.ObjectLiteralElementLike[] = symbolMembersToTransform.map((member) => {
            const typeOfMember = typeChecker.getTypeOfSymbolAtLocation(member, node);
            // Create syntax of the form '"x": y' using the interface property name for x and the transformation of its type as y
            return factory.createPropertyAssignment(
                factory.createStringLiteral(member.name),
                _transformType(typeOfMember)
            );
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
            return createIndexCallExpression(factory, CONSTANTS.TUPLE);
        }
        // transform the type argument to a data generator to pass to the `array` creation function
        const transformed = _transformType(typeArg);
        return createIndexCallExpression(factory, CONSTANTS.ARRAY, [transformed]);
    }

    /**
     * Recursively transform members of a tuple type, e.g. [number, 5, false] will run
     * `_transformType` on number, 5, and false to get an array of expressions.
     */
    function createTupleArguments(type: ts.TupleType): ts.Expression[] {
        return type.typeArguments?.map((typeArg) => _transformType(typeArg)) ?? [];
    }

    /**
     * Transforms literal types, (e.g. 'test', 5, false, etc) to constant('test'), constant(5), constant(false), etc.
     */
    function createConstantCallExpression(type: ts.LiteralType): ts.Expression {
        const { flags } = type;

        if (flags & ts.TypeFlags.NumberLiteral) {
            return createIndexCallExpression(factory, CONSTANTS.CONSTANT, [
                factory.createNumericLiteral(type.value as number)
            ]);
        } else if (flags & ts.TypeFlags.StringLiteral) {
            return createIndexCallExpression(factory, CONSTANTS.CONSTANT, [
                factory.createStringLiteral(type.value as string)
            ]);
        } else if (flags & ts.TypeFlags.BooleanLiteral) {
            // Boolean literal does not have a value, so instead need to go off the intrinsicName.
            return createIndexCallExpression(factory, CONSTANTS.CONSTANT, [
                (type as any).intrinsicName === 'true' ? factory.createTrue() : factory.createFalse()
            ]);
        } else {
            // constant(undefined) as a fall through case
            return createConstantUndefinedExpression(factory);
        }
    }

    /**
     * Transforms interpolated template string types, e.g. `${string}!` would have
     *   - texts: ["", "!"]
     *   - types: intrinsicType: 'string'
     */
    function createTemplateLiteralExpression(type: ts.TemplateLiteralType): ts.Expression {
        const { texts, types } = type;

        const textExpressions = texts.map((t) => factory.createStringLiteral(t));
        const transformedTypes = types.map((t) => _transformType(t));

        return createIndexCallExpression(factory, CONSTANTS.INTERPOLATE, [
            factory.createArrayLiteralExpression(textExpressions),
            factory.createArrayLiteralExpression(transformedTypes)
        ]);
    }

    /***********************************************************
     * HELPER FUNCTIONS
     * ********************************************************/

    /**
     * Helper function that extends the [[debug]] function to indent by the config's number of spaces for each
     * type in the resolutionStack. Also adds formatting to the strings.
     */
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
     * Reports an error with a stack trace based on the type's declarations
     * @returns an array of strings which can be spread to a logging function such as `console.warn`
     */
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

    /**
     * Helper function that debug logs if debug logging is enabled in the configuration
     */
    function debug(...args: StringCoercible[]) {
        if (!config.DG_DEBUG_ENABLED) {
            return;
        }
        console.debug(...args);
    }

    // Kick off the recursion (inside transformType) by calling the inner function
    return _transformType(type);
}

/***********************************************************
 * TRANSFORMATION SCOPE INDEPENDENT HELPER FUNCTIONS
 * ********************************************************/

/**
 * Creates constant(undefined)
 */
function createConstantUndefinedExpression(factory: ts.NodeFactory): ts.Expression {
    return createIndexCallExpression(factory, CONSTANTS.CONSTANT, [factory.createIdentifier('undefined')]);
}

/**
 * Creates a function call expression on the index data generator package (e.g. 'semble-ts').
 * @param access the index package function to call
 * @param args arguments to call the function with
 */
function createIndexCallExpression(
    factory: ts.NodeFactory,
    access: keyof typeof Index,
    args: ts.Expression[] = []
): ts.Expression {
    return createSingleAccessCallExpression(factory, CONSTANTS.INDEX, access, args);
}

/**
 * Creates a function call expression on the library data generator package (e.g. 'semble-ts/library').
 * @param access the library package function to call
 * @param args arguments to call the function with
 */
function createLibraryCallExpression(
    factory: ts.NodeFactory,
    access: keyof typeof Library,
    args: ts.Expression[] = []
): ts.Expression {
    return createSingleAccessCallExpression(factory, CONSTANTS.LIBRARY, access, args);
}

/**
 * Base function for calling a namespaced function in the form "namespace.function(...args)"
 * @param base the base namespace name
 * @param access the function to call from the namespace
 * @param args arguments to call the function with
 */
function createSingleAccessCallExpression(
    factory: ts.NodeFactory,
    base: string,
    access: string,
    args: ts.Expression[] = []
): ts.Expression {
    return factory.createCallExpression(
        factory.createPropertyAccessExpression(factory.createIdentifier(base), factory.createIdentifier(access)),
        undefined,
        args
    );
}

/**
 * Append "import *" declarations for every needed Data Generator module.
 */
function appendDefaultImports(factory: ts.NodeFactory, host: ts.ImportDeclaration): ts.ImportDeclaration[] {
    return appendNamedImportNode(
        factory,
        appendNamedImportNode(factory, host, CONSTANTS.LIBRARY, CONSTANTS.LIBRARY_LOCATION),
        CONSTANTS.INDEX,
        CONSTANTS.INDEX_LOCATION
    );
}

/**
 * Transform an ImportDeclaration into an array of import declarations to tack on an extra import to an existing node.
 */
function appendNamedImportNode(
    factory: ts.NodeFactory,
    host: ts.ImportDeclaration | ts.ImportDeclaration[],
    namespace: string,
    from: string
): ts.ImportDeclaration[] {
    return [
        // If the host is an existing array of import declarations, append the new one to the end.
        ...(Array.isArray(host) ? host : [host]),
        factory.createImportDeclaration(
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
