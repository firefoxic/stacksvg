import { describe, expect, test } from "vitest"

import { parseArgs } from "../../src/cli.js"

describe(`cli`, () => {
	test(`Arguments should default to the working directory and the stack.svg output`, () => {
		expect(parseArgs([])).toEqual({
			input: `.`,
			output: `stack.svg`,
			help: false,
			version: false,
		})
	})

	test(`Arguments should read the input directory from both option forms`, () => {
		expect(parseArgs([`-i`, `icons`]).input).toBe(`icons`)
		expect(parseArgs([`--input`, `src/icons`]).input).toBe(`src/icons`)
	})

	test(`Arguments should read the output from both option forms`, () => {
		expect(parseArgs([`-o`, `out.svg`]).output).toBe(`out.svg`)
		expect(parseArgs([`--output`, `dist/stack.svg`]).output).toBe(`dist/stack.svg`)
	})

	test(`Arguments should keep the values that follow the options`, () => {
		expect(parseArgs([`-i`, `icons`, `-o`, `out.svg`])).toEqual({
			input: `icons`,
			output: `out.svg`,
			help: false,
			version: false,
		})
	})

	test(`Arguments should recognize the help and the version flags`, () => {
		expect(parseArgs([`--help`]).help).toBe(true)
		expect(parseArgs([`-h`]).help).toBe(true)
		expect(parseArgs([`--version`]).version).toBe(true)
		expect(parseArgs([`-v`]).version).toBe(true)
	})

	test(`Arguments should throw when an option has no value`, () => {
		expect(() => parseArgs([`-i`])).toThrow(`Missing value for -i`)
		expect(() => parseArgs([`-o`])).toThrow(`Missing value for -o`)
	})

	test(`Arguments should throw on an unexpected positional argument`, () => {
		expect(() => parseArgs([`icons/*.svg`])).toThrow(`Unexpected argument: icons/*.svg`)
	})
})
