#!/usr/bin/env node

import { glob, mkdir, readFile, realpath, stat, writeFile } from "node:fs/promises"
import path from "node:path"

import { type SvgSource, stacksvg } from "./index.ts"

const DEFAULT_INPUT = `.`

const DEFAULT_OUTPUT = `stack.svg`

const HELP = `
Combine svg files into one stack sprite.

Usage:
  stacksvg [options]

Options:
  -i, --input <dir>    Directory to read the svg from, recursively (default: the working directory)
  -o, --output <file>  Write the sprite to <file> (default: ${DEFAULT_OUTPUT})
  -h, --help           Print this help
  -v, --version        Print the version
`

/**
 * Parsed command-line arguments.
 */
export interface CliArgs {

	/**
	 * Directory to read the svg from, recursively.
	 */
	input: string,

	/**
	 * Path of the file to write the sprite to.
	 */
	output: string,

	/**
	 * Whether help was requested.
	 */
	help: boolean,

	/**
	 * Whether the version was requested.
	 */
	version: boolean,
}

/**
 * Parse the command-line arguments.
 *
 * @param {string[]} argv - Arguments without the node binary and the script path.
 * @returns {CliArgs} Parsed arguments.
 */
export function parseArgs (argv: string[]): CliArgs {
	let input = DEFAULT_INPUT
	let output = DEFAULT_OUTPUT
	let help = false
	let version = false

	for (let i = 0; i < argv.length; i += 1) {
		let arg = argv[i]

		if (arg === `-h` || arg === `--help`) {
			help = true
			continue
		}

		if (arg === `-v` || arg === `--version`) {
			version = true
			continue
		}

		if (arg === `-i` || arg === `--input`) {
			let value = argv[i + 1]

			if (value === undefined) throw new Error(`Missing value for ${arg}`)

			input = value
			i += 1
			continue
		}

		if (arg === `-o` || arg === `--output`) {
			let value = argv[i + 1]

			if (value === undefined) throw new Error(`Missing value for ${arg}`)

			output = value
			i += 1
			continue
		}

		throw new Error(`Unexpected argument: ${arg}`)
	}

	return { input, output, help, version }
}

/**
 * Read the sources to combine.
 *
 * Every svg file under the input directory is taken. The output file is left out, so that a sprite written into the input directory is not read back on the next run. Files are taken in sorted order so the fragments keep a stable order, and each path is made relative to the input directory, the way the fragment id reads.
 *
 * @param {string} input - Directory to read the svg from, recursively.
 * @param {string} output - Path of the sprite, excluded from the sources.
 * @returns {Promise<SvgSource[]>} Sources to combine.
 */
export async function collectSources (input: string, output: string): Promise<SvgSource[]> {
	let base = path.resolve(input)
	let outputPath = path.resolve(output)
	let files = new Set<string>()

	for await (let file of glob(path.join(base, `**`, `*.svg`))) files.add(file)

	let entries = await Promise.all([...files].toSorted().map(async (file) => {
		let resolved = path.resolve(file)

		if (resolved === outputPath) return null
		if (!(await stat(file)).isFile()) return null

		return {
			path: path.relative(base, resolved),
			contents: await readFile(file, `utf8`),
		}
	}))

	return entries.filter((entry): entry is SvgSource => entry !== null)
}

/**
 * Run the command line.
 *
 * @param {string[]} argv - Arguments without the node binary and the script path.
 * @returns {Promise<void>} Resolves when the sprite is written or the action is done.
 */
export async function main (argv: string[]): Promise<void> {
	let args: CliArgs

	try {
		args = parseArgs(argv)
	}
	catch (error) {
		throw new Error((error as Error).message, { cause: error })
	}

	if (args.help) {
		console.info(HELP)
		return
	}

	if (args.version) {
		let { version } = JSON.parse(await readFile(new URL(`../package.json`, import.meta.url), `utf8`)) as { version: string }

		console.info(version)
		return
	}

	let sources = await collectSources(args.input, args.output)
	if (sources.length === 0) throw new Error(`No svg files found in ${args.input}`)

	let sprite = stacksvg(sources)
	if (sprite === null) {
		console.warn(`No svg elements found, nothing to write`)
		return
	}

	await mkdir(path.dirname(path.resolve(args.output)), { recursive: true })
	await writeFile(args.output, sprite)
}

/**
 * Whether the module is the process entry point.
 *
 * The comparison resolves symlinks so the `bin` shim, which points at this file, is recognized the same as a direct run.
 *
 * @returns {Promise<boolean>} True when run as the command.
 */
async function isMain (): Promise<boolean> {
	let entry = process.argv[1]

	if (!entry) return false

	try {
		return await realpath(entry) === await realpath(import.meta.filename)
	}
	catch {
		return false
	}
}

if (await isMain()) {
	await main(process.argv.slice(2)).catch((error: Error) => {
		console.error(error.message)
		process.exitCode = 1
	})
}
