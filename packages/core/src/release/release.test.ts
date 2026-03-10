/**
 * Release smoke tests — import exclusively from the package's public exports map
 * (i.e. the built dist/) to verify downstream consumers can use the package.
 *
 * Run via `pnpm test:release` which builds first, then runs this file.
 */
import {
	type DataGenerator,
	anyOf,
	bool,
	char,
	constant,
	createGenerator,
	date,
	either,
	iif,
	int,
	interpolate,
	isDataGenerator,
	many,
	number,
	optional,
	sequence,
	string,
	struct,
	tuple,
	uuid,
	uuidGenerator
} from '@data-generators/core';

// ─── isDataGenerator ──────────────────────────────────────────────────────────

test('isDataGenerator identifies generators correctly', () => {
	expect(isDataGenerator(int())).toBe(true);
	expect(isDataGenerator(null)).toBe(false);
	expect(isDataGenerator(undefined)).toBe(false);
	expect(isDataGenerator({ create: 'not a function' })).toBe(false);
});

// ─── Primitives ───────────────────────────────────────────────────────────────

test('int produces integers within range', () => {
	const gen = int(1, 10);
	for (let i = 0; i < 20; i++) {
		const v = gen.create();
		expect(Number.isInteger(v)).toBe(true);
		expect(v).toBeGreaterThanOrEqual(1);
		expect(v).toBeLessThanOrEqual(10);
	}
});

test('number produces floats within range', () => {
	const v = number(0, 1).create();
	expect(v).toBeGreaterThanOrEqual(0);
	expect(v).toBeLessThan(1);
});

test('bool produces booleans', () => {
	const v = bool().create();
	expect(typeof v).toBe('boolean');
});

test('char produces a single character', () => {
	// char is a singleton DataGenerator instance, not a factory
	const v = char.create();
	expect(typeof v).toBe('string');
	expect(v.length).toBe(1);
});

test('string produces a string of given length', () => {
	const v = string(8).create();
	expect(typeof v).toBe('string');
	expect(v.length).toBe(8);
});

// ─── UUID ─────────────────────────────────────────────────────────────────────

test('uuid produces RFC-4122 v4 UUIDs', () => {
	// uuid is a singleton DataGenerator instance, not a factory
	const v = uuid.create();
	expect(v).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
});

test('uuidGenerator is a DataGenerator', () => {
	expect(isDataGenerator(uuidGenerator)).toBe(true);
});

// ─── Date ─────────────────────────────────────────────────────────────────────

test('date produces a Date instance', () => {
	expect(date().create()).toBeInstanceOf(Date);
});

// ─── constant / sequence / anyOf / either / iif ───────────────────────────────

test('constant always returns the given value', () => {
	expect(constant(42).create()).toBe(42);
	expect(constant('hello').create()).toBe('hello');
});

test('sequence cycles through provided generators', () => {
	const gen = sequence(constant('a'), constant('b'), constant('c'));
	expect(gen.createAll()).toEqual(['a', 'b', 'c']);
});

test('anyOf picks from provided generators', () => {
	const allowed = new Set([1, 2, 3]);
	const gen = anyOf(constant(1), constant(2), constant(3));
	for (let i = 0; i < 20; i++) {
		expect(allowed.has(gen.create())).toBe(true);
	}
});

test('either picks from two generators', () => {
	const allowed = new Set(['left', 'right']);
	const gen = either(constant('left'), constant('right'));
	for (let i = 0; i < 20; i++) {
		expect(allowed.has(gen.create())).toBe(true);
	}
});

test('iif uses condition to branch generators', () => {
	expect(iif(() => true, constant('yes'), constant('no')).create()).toBe('yes');
	expect(iif(() => false, constant('yes'), constant('no')).create()).toBe('no');
});

// ─── struct / tuple ───────────────────────────────────────────────────────────

test('struct generates a correctly shaped object', () => {
	const gen = struct({ id: int(1, 100), active: bool(), label: string(5) });
	const v = gen.create();
	expect(typeof v.id).toBe('number');
	expect(Number.isInteger(v.id)).toBe(true);
	expect(typeof v.active).toBe('boolean');
	expect(v.label.length).toBe(5);
});

test('tuple generates a fixed-length array', () => {
	const gen = tuple(int(1, 9), bool(), constant('x'));
	const [n, b, s] = gen.create();
	expect(Number.isInteger(n)).toBe(true);
	expect(typeof b).toBe('boolean');
	expect(s).toBe('x');
});

// ─── Transformers: many / take / one / optional ───────────────────────────────

test('many returns an array of the given length', () => {
	const v = int(1, 5).pipe(many(3)).create();
	expect(Array.isArray(v)).toBe(true);
	expect(v.length).toBe(3);
	v.forEach((x: number) => {
		expect(x).toBeGreaterThanOrEqual(1);
		expect(x).toBeLessThanOrEqual(5);
	});
});

test('take returns the requested count', () => {
	const values = int(0, 9).take(5).createAll();
	expect(values.length).toBe(5);
});

test('one returns a single value via .one()', () => {
	const v = int(1, 10).one().create();
	expect(typeof v).toBe('number');
	expect(Number.isInteger(v)).toBe(true);
});

test('optional yields undefined roughly half the time', () => {
	const gen = optional(constant(42));
	const results = Array.from({ length: 100 }, () => gen.create());
	const undefinedCount = results.filter((v) => v === undefined).length;
	// very unlikely to be 0 or 100 in 100 samples
	expect(undefinedCount).toBeGreaterThan(0);
	expect(undefinedCount).toBeLessThan(100);
});

// ─── interpolate ──────────────────────────────────────────────────────────────

test('interpolate produces a formatted string', () => {
	const v = interpolate`user-${int(1, 999)}`.create();
	expect(v).toMatch(/^user-\d+$/);
});

// ─── createGenerator (low-level API) ──────────────────────────────────────────

test('createGenerator wraps an iterator correctly', () => {
	let n = 0;
	const gen: DataGenerator<number> = createGenerator(function* () {
		while (true) yield n++;
	});
	expect(gen.create()).toBe(0);
	expect(gen.create()).toBe(1);
	expect(gen.create()).toBe(2);
});
