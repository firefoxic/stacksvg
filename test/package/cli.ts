import { execFile } from "node:child_process"
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { promisify } from "node:util"

import { afterAll, describe, expect, test } from "vitest"

const run = promisify(execFile)

const root = fileURLToPath(new URL(`../../`, import.meta.url))
const cli = path.join(root, `src/cli.ts`)
const tmpRoot = path.join(root, `tmp`)

let dirs: string[] = []

/**
 * Create a fresh scratch directory under the project `tmp/`.
 *
 * @returns {Promise<string>} Path of the directory.
 */
async function makeDir (): Promise<string> {
	await mkdir(tmpRoot, { recursive: true })

	let dir = await mkdtemp(path.join(tmpRoot, `cli-`))

	dirs.push(dir)

	return dir
}

afterAll(async () => {
	await Promise.all(dirs.map((dir) => rm(dir, { recursive: true, force: true })))
})

/**
 * This suite drives the command line end to end against the TypeScript source, with no build step: type stripping runs the `.ts` files as-is.
 */
describe(`cli`, () => {
	test(`Command should print the version`, async () => {
		let { stdout } = await run(process.execPath, [cli, `--version`])

		expect(stdout.trim()).toMatch(/^\d+\.\d+\.\d+/u)
	})

	test(`Command should print the help`, async () => {
		let { stdout } = await run(process.execPath, [cli, `--help`])

		expect(stdout).toContain(`Usage:`)
		expect(stdout).toContain(`stacksvg [options]`)
	})

	test(`Command should read the input directory recursively and name fragments relative to it`, async () => {
		let dir = await makeDir()
		let icons = path.join(dir, `icons`)

		await mkdir(path.join(icons, `sub`), { recursive: true })
		await writeFile(path.join(icons, `circle.svg`), `<svg viewBox="0 0 4 4"><circle cx="2" cy="2" r="1"/></svg>`)
		await writeFile(path.join(icons, `sub`, `square.svg`), `<svg><rect x="1" y="1" width="2" height="2"/></svg>`)

		let output = path.join(dir, `stack.svg`)

		await run(process.execPath, [cli, `-i`, icons, `-o`, output])

		let sprite = await readFile(output, `utf8`)

		expect(sprite).toBe(`<svg xmlns="http://www.w3.org/2000/svg"><style>:root svg:not(:target){display:none}</style><svg viewBox="0 0 4 4" id="circle"><circle cx="2" cy="2" r="1"></circle></svg><svg id="sub_square"><rect x="1" y="1" width="2" height="2"></rect></svg></svg>`)
	})

	test(`Command should not read the sprite it wrote on the previous run`, async () => {
		let dir = await makeDir()

		await writeFile(path.join(dir, `circle.svg`), `<svg viewBox="0 0 4 4"><circle cx="2" cy="2" r="1"/></svg>`)

		let output = path.join(dir, `stack.svg`)

		await run(process.execPath, [cli, `-i`, dir, `-o`, output])
		let first = await readFile(output, `utf8`)

		await run(process.execPath, [cli, `-i`, dir, `-o`, output])
		let second = await readFile(output, `utf8`)

		expect(second).toBe(first)
		expect(second).not.toContain(`id="stack"`)
	})

	test(`Command should fail when no svg file is found`, async () => {
		let dir = await makeDir()

		await expect(run(process.execPath, [cli, `-i`, dir])).rejects.toThrow(/No svg files found/u)
	})
})
