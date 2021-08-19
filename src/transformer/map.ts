import { DataGenerator } from '../interfaces/data-generator.interface';

/**
 * Pipeable version of {@link DataGenerator.map}.
 *
 * @category Transformer
 */
export const dgMap =
    <T, U>(project: (output: T) => U) =>
    (dg: DataGenerator<T>) =>
        dg.map(project);

/**
 * Pipeable version of {@link DataGenerator.flatMap}
 *
 * @category Transformer
 */
export const dgFlatMap =
    <T, U>(project: (output: T) => DataGenerator<U>) =>
    (dg: DataGenerator<T>) =>
        dg.flatMap(project);
