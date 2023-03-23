import { getBrand } from './brand';
import { DataGenerator } from './data-generator.interface';

/**
 * Test a value to see if it is a Data Generator. Also acts as a type guard.
 *
 * @category Utility
 * @param v A value to test
 * @returns boolean
 */
export function isDataGenerator(v: unknown): v is DataGenerator<unknown> {
    return (
        Object.prototype.hasOwnProperty.call(v, 'brand') &&
        (v as DataGenerator<unknown>).brand === Symbol.for(getBrand())
    );
}
