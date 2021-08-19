import { functionGenerator } from '../library/function';

/**
 * Pipe operator to convert a DataGenerator to a DataGenerator that generates a function returning the piped generator's output
 *
 * @category Transformer
 * @returns a {@link functionGenerator}
 */
export const toFunctionGenerator = () => functionGenerator;
