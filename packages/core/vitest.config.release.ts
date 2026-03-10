import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
	resolve: {
		// Mirror the conditions Angular/Vite uses when consuming the package
		conditions: ['import'],
		alias: {
			// Point the package name at the built ESM output, exactly as a
			// downstream consumer would resolve it via the exports map
			'@data-generators/core': resolve(__dirname, 'dist/index.js')
		}
	},
	test: {
		globals: true,
		environment: 'node',
		include: ['src/release/**/*.test.ts'],
		name: 'release'
	}
});
