/**
 * Interface for a factory that generates random test data
 */
export interface DataGenerator<T> {
    /**
     * Generate a single output
     *
     * @returns a single value of type `T`.
     */
    create: () => T;

    /**
     * Generate an array of input length of outputs
     *
     * @param length the number of outputs to generate
     * @returns an array of length `length` of generated outputs
     */
    createMany: (length: number) => T[];

    /**
     * @param project mapping function from a single output of {@link DataGenerator.create}
     * to a new value.
     * @returns a new {@link DataGenerator} that uses the projection function to generate output.
     */
    map: <U>(project: (output: T) => U) => DataGenerator<U>;

    /**
     * @param project mapping function from single output of {@link DataGenerator.create} to
     * a new {@link DataGenerator}.
     * @returns a new data generator created by `project`.
     */
    flatMap: <U>(project: (output: T) => DataGenerator<U>) => DataGenerator<U>;
}
