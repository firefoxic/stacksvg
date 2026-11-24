#!/usr/bin/env node

import { readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import { type SvgSource, stacksvg } from "../src/index.ts"

/**
 * Regenerate the example sprite from the example icons, the way `make smoke` does.
 *
 * The icons are read in directory order, which is what fixes the order of the fragments in the sprite.
 */
let iconsDir = `./docs/example/icons`

let names = (await readdir(iconsDir)).filter((name) => name.endsWith(`.svg`))

let sources: SvgSource[] = await Promise.all(names.map(async (name) => ({
	path: name,
	contents: await readFile(path.join(iconsDir, name), `utf8`),
})))

let sprite = stacksvg(sources)

if (sprite !== null) await writeFile(`./docs/example/stack.svg`, sprite)
