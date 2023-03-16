import { DataGenerator } from '../interfaces/data-generator.interface';

interface DataGeneratorBuilder {
    readonly _dataGeneratorBuilderBrand: unique symbol;
    <T>(): DataGenerator<T>;
}

export const build: DataGeneratorBuilder = Object.assign(
    () => {
        throw new Error('Build must be transformed into a real DataGenerator by semble-ts/compiler');
    },
    <DataGeneratorBuilder>{
        _dataGeneratorBuilderBrand: Symbol.for('_dataGeneratorBuilder')
    }
);
