import { readFile } from 'node:fs/promises'

import { defineConfig } from 'tsup'

export default defineConfig(async options => ({
	entry: ['src/index.ts'],
	minify: !options.watch,
	clean: !options.watch,
	dts: !options.watch,
	target: 'node18',
	splitting: false,
	platform: 'node',
	format: 'esm',
	sourcemap: options.watch ? 'inline' : true,
	onSuccess: options.watch ? 'pnpm debug' : undefined,
	define: {
		$html: JSON.stringify(await readFile('index.html', 'utf8'))
	}
}))
