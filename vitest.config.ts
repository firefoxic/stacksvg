import { defineConfig } from "vitest/config"

export default defineConfig({
	test: {
		watch: false,
		projects: [
			{
				test: {
					name: `unit`,
					include: [`test/unit/**/*.ts`],
				},
			},
			{
				test: {
					name: `package`,
					include: [`test/package/**/*.ts`],
				},
			},
		],
		coverage: {
			include: [`src/**`],
			exclude: [
				// The CLI is a thin input/output wrapper around the library; its behaviour is covered end to end in the `package` project.
				`src/cli.ts`,
			],
			reporter: [`text`, `html`],
			thresholds: {
				statements: 100,
				functions: 100,
				lines: 100,
				// The two remaining branches are `??` fallbacks that only satisfy the type checker: neither state is reachable.
				branches: 96,
			},
		},
	},
})
