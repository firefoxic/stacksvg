import { describe, expect, test } from "vitest"

import { StackSvgCreator, stacksvg } from "../../src/index.ts"

/**
 * This suite proves the package works end to end against the TypeScript source
 * directly, with no build step: type stripping runs the `.ts` files as-is.
 */
describe(`package`, () => {
	test(`Package should export the plugin factory`, () => {
		expect(typeof stacksvg).toBe(`function`)
	})

	test(`Package should export the creator class`, () => {
		expect(typeof StackSvgCreator).toBe(`function`)
	})

	test(`Package should build a sprite end to end`, () => {
		let sprite = stacksvg([
			{
				path: `circle.svg`,
				contents: `<svg viewBox="0 0 4 4"><circle cx="2" cy="2" r="1"/></svg>`,
			},
		])

		expect(sprite).toBe(`<svg xmlns="http://www.w3.org/2000/svg"><style>:root svg:not(:target){display:none}</style><svg viewBox="0 0 4 4" id="circle"><circle cx="2" cy="2" r="1"></circle></svg></svg>`)
	})

	test(`Package should build a sprite incrementally through the creator class`, () => {
		let processor = new StackSvgCreator()

		processor.add(`<svg viewBox="0 0 4 4"><circle cx="2" cy="2" r="1"/></svg>`, `circle.svg`)

		expect(processor.getStackSprite()).toBe(`<svg xmlns="http://www.w3.org/2000/svg"><style>:root svg:not(:target){display:none}</style><svg viewBox="0 0 4 4" id="circle"><circle cx="2" cy="2" r="1"></circle></svg></svg>`)
	})
})
