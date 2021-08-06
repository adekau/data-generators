import { createGenerator } from './data-generator';
import { DataGenerator } from './data-generator.interface';

export const struct = <T>(generators: { [K in keyof T]-?: DataGenerator<T[K]> }): DataGenerator<T> =>
    createGenerator(() => {
        return Object.keys(generators).reduce((acc, key) => {
            return {
                ...acc,
                [key]: generators[key as keyof typeof generators].create()
            };
        }, {} as { [K in keyof T]: T[K] });
    });
