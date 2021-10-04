import * as lib from '../../library';
import * as dg from '../../index';

/**
 * Mimic the behavior of C# nameof so if anything changes in the future it's a type error here
 * and won't accidentally break things.
 */
function nameOf<TName extends keyof typeof lib | keyof typeof dg>(name: TName) {
    return name;
}

export const CONSTANTS = {
    /**
     * Name of the environment variable to look for if debug is enabled
     */
    DEBUG_ENABLE_ENV_VAR: 'DG_DEBUG_ENABLED' as const,
    DEBUG_ENABLE_DEFAULT: false as const,
    DEBUG_WIDTH_ENV_VAR: 'DG_DEBUG_WIDTH' as const,
    DEBUG_WIDTH_DEFAULT: 4 as const,
    /**
     * Name of the method to replace the AST node of with a Data Generator
     */
    BUILD_NODE_NAME: nameOf('build'),
    /**
     * Need to import methods under a "import *" node to make replacement using an identifier
     * expression easier
     */
    INDEX: '__dg' as const,
    INDEX_LOCATION: '@nwps/data-generators' as const,
    LIBRARY: '__dgLib' as const,
    LIBRARY_LOCATION: '@nwps/data-generators/library' as const,
    /**
     * TypeScript doesn't expose a lot of information about function types without the `FunctionTypeNode`
     * `TypeNode` being present
     */
    FUNCTION_TYPE_ID: '__call' as const,
    /**
     * Part of identifying the build node (in conjunction with BUILD_NODE_NAME and FUNCTION_TYPE_ID)
     * On the exported BUILD_NODE_NAME method will be a unique symbol under the name below.
     */
    DATA_GENERATOR_BUILDER_BRAND: '_dataGeneratorBuilderBrand' as const,

    /**
     * Data Generator Identifiers.
     * The constants below are used for creating ts.Identifier expressions that will be resolved by
     * the added "import *" expressions.
     */
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
