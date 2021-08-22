import { DataGenerator } from '../interfaces/data-generator.interface';

export type Inner<T extends readonly DataGenerator<unknown>[]> = T[number] extends DataGenerator<infer U> ? U : never;
