import { numberGenerator } from "../library/primitives";

describe('Data Generators: One', () => {
    it('Should narrow an infinite generator to a single generator', () => {
		const result = numberGenerator().one().createAll();

		expect(result.length).toBe(1);
		expect(result[0]).toBeInstanceOf(Number);
	});
});
