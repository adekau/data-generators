import { constant } from '../creation/constant';
import { struct, _struct } from '../creation/struct';
import { charGenerator, integerGenerator, numberGenerator, stringGenerator } from '../library/primitives';
import { withOverrides } from './struct';

// describe('Data Generators (Utility): Struct', () => {
//     describe('structWithOverrides', () => {
//         const g = struct({ g: [1, 2, 3] }).pipe(withOverrides());

//         const gen = struct({
//             num: numberGenerator(5, 10),
//             str: stringGenerator()
//         }).pipe(withOverrides());

//         it('should allow overriding struct generators', () => {
//             expect(
//                 gen({
//                     num: constant(16)
//                 }).create()
//             ).toEqual({
//                 num: 16,
//                 str: jasmine.any(String)
//             });

//             expect(
//                 gen({ num: integerGenerator(20, 30), str: charGenerator })
//                     .createMany(4)
//                     .every(({ num, str }) => num >= 20 && num <= 30 && str.length === 1)
//             ).toBeTrue();
//         });

//         it('should default to struct with no provided overrides', () => {
//             expect(gen().create().str.length).toBe(10);
//             expect(
//                 gen()
//                     .createMany(4)
//                     .every(({ num, str }) => num >= 5 && num <= 10 && str.length === 10)
//             ).toBeTrue();
//         });
//     });
// });
