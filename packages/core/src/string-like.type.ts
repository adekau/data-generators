/**
 * Anything that can be coerced into a string.
 *
 * @internal
 */
export type StringLike = { toString: () => string };
