import { describe, expect, test } from "vitest"

import { type SvgSource, stacksvg } from "../../src/index.js"

function build (sources: SvgSource[]): string {
	let sprite = stacksvg(sources)

	if (sprite === null) throw new Error(`expected a sprite`)

	return sprite
}

describe(`stacksvg`, () => {
	test(`Function should not create an empty svg file`, () => {
		expect(stacksvg([])).toBeNull()
	})

	test(`Function should correctly merge svg files`, () => {
		let actual = build([
			{
				path: `circle.svg`,
				contents: `<svg viewBox="0 0 4 4" preserveAspectRatio="xMinYMid meet"><circle cx="2" cy="2" r="1"/></svg>`,
			},
			{
				path: `square.svg`,
				contents: `<svg><rect x="1" y="1" width="2" height="2"/></svg>`,
			},
		])
		let expected = `<svg xmlns="http://www.w3.org/2000/svg"><style>:root svg:not(:target){display:none}</style><svg viewBox="0 0 4 4" preserveAspectRatio="xMinYMid meet" id="circle"><circle cx="2" cy="2" r="1"></circle></svg><svg id="square"><rect x="1" y="1" width="2" height="2"></rect></svg></svg>`

		expect(actual).toBe(expected)
	})

	test(`Function should not include content without an svg element`, () => {
		let actual = build([
			{
				path: `circle.svg`,
				contents: `<svg viewBox="0 0 4 4"><circle cx="2" cy="2" r="1"/></svg>`,
			},
			{
				path: `square.svg`,
				contents: ``,
			},
		])
		let expected = `<svg xmlns="http://www.w3.org/2000/svg"><style>:root svg:not(:target){display:none}</style><svg viewBox="0 0 4 4" id="circle"><circle cx="2" cy="2" r="1"></circle></svg></svg>`

		expect(actual).toBe(expected)
	})

	test(`Function should not include invalid files`, () => {
		let actual = build([
			{
				path: `circle.svg`,
				contents: `<svg viewBox="0 0 4 4"><circle cx="2" cy="2" r="1"/></svg>`,
			},
			{
				path: `square.svg`,
				contents: `not an svg`,
			},
		])
		let expected = `<svg xmlns="http://www.w3.org/2000/svg"><style>:root svg:not(:target){display:none}</style><svg viewBox="0 0 4 4" id="circle"><circle cx="2" cy="2" r="1"></circle></svg></svg>`

		expect(actual).toBe(expected)
	})

	test(`Function should throw if files have the same name`, () => {
		expect(() => build([
			{
				path: `circle.svg`,
				contents: `<svg></svg>`,
			},
			{
				path: `circle.svg`,
				contents: `<svg></svg>`,
			},
		])).toThrow(`File name should be unique: circle`)
	})

	test(`Function should replace the spaces with the hyphens`, () => {
		let actual = build([
			{
				path: `icon like.svg`,
				contents: `<svg xmlns="http://www.w3.org/2000/svg"/>`,
			},
		])
		let expected = `<svg xmlns="http://www.w3.org/2000/svg"><style>:root svg:not(:target){display:none}</style><svg id="icon-like"></svg></svg>`

		expect(actual).toBe(expected)
	})

	test(`Function should replace the directory separator with the underscore`, () => {
		let actual = build([
			{
				path: `icons/like.svg`,
				contents: `<svg xmlns="http://www.w3.org/2000/svg"/>`,
			},
		])
		let expected = `<svg xmlns="http://www.w3.org/2000/svg"><style>:root svg:not(:target){display:none}</style><svg id="icons_like"></svg></svg>`

		expect(actual).toBe(expected)
	})

	test(`Function should generate unique inner id`, () => {
		let actual = build([
			{
				path: `one.svg`,
				contents: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><mask id="a"/><mask id="b"/><g><mask id="c"/></g><path mask="url(#a)"/><g><path mask="url(#b)"/><g><path mask="url(#c)"/></g></g></svg>`,
			},
			{
				path: `two.svg`,
				contents: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><mask id="a"/><mask id="b"/><g><mask id="c"/></g><path mask="url(#a)"/><g><path mask="url(#b)"/><g><path mask="url(#c)"/></g></g></svg>`,
			},
		])
		let expected = `<svg xmlns="http://www.w3.org/2000/svg"><style>:root svg:not(:target){display:none}</style><svg viewBox="0 0 40 40" id="one"><mask id="one_0"></mask><mask id="one_1"></mask><g><mask id="one_2"></mask></g><path mask="url(#one_0)"></path><g><path mask="url(#one_1)"></path><g><path mask="url(#one_2)"></path></g></g></svg><svg viewBox="0 0 40 40" id="two"><mask id="two_0"></mask><mask id="two_1"></mask><g><mask id="two_2"></mask></g><path mask="url(#two_0)"></path><g><path mask="url(#two_1)"></path><g><path mask="url(#two_2)"></path></g></g></svg></svg>`

		expect(actual).toBe(expected)
	})

	test(`Function should not rename an identifier twice`, () => {
		let actual = build([
			{
				path: `icon.svg`,
				contents: `<svg viewBox="0 0 10 10"><mask id="a"/><mask id="b"/><mask id="icon_1"/><path mask="url(#b)"/><path mask="url(#icon_1)"/></svg>`,
			},
		])
		let expected = `<svg xmlns="http://www.w3.org/2000/svg"><style>:root svg:not(:target){display:none}</style><svg viewBox="0 0 10 10" id="icon"><mask id="icon_0"></mask><mask id="icon_1"></mask><mask id="icon_2"></mask><path mask="url(#icon_1)"></path><path mask="url(#icon_2)"></path></svg></svg>`

		expect(actual).toBe(expected)
	})

	test(`Function should update the references from the root svg of an icon`, () => {
		let actual = build([
			{
				path: `icon.svg`,
				contents: `<svg viewBox="0 0 10 10" clip-path="url(#c)"><clipPath id="c"><rect/></clipPath></svg>`,
			},
		])
		let expected = `<svg xmlns="http://www.w3.org/2000/svg"><style>:root svg:not(:target){display:none}</style><svg viewBox="0 0 10 10" clip-path="url(#icon_0)" id="icon"><clipPath id="icon_0"><rect></rect></clipPath></svg></svg>`

		expect(actual).toBe(expected)
	})

	test(`Function should not match an identifier inside a longer one`, () => {
		let actual = build([
			{
				path: `icon.svg`,
				contents: `<svg viewBox="0 0 10 10"><mask id="a"/><mask id="ab"/><mask id="a-b"/><path mask="url(#ab)"/><path mask="url(#a-b)"/><path mask="url(#a)"/></svg>`,
			},
		])
		let expected = `<svg xmlns="http://www.w3.org/2000/svg"><style>:root svg:not(:target){display:none}</style><svg viewBox="0 0 10 10" id="icon"><mask id="icon_0"></mask><mask id="icon_1"></mask><mask id="icon_2"></mask><path mask="url(#icon_1)"></path><path mask="url(#icon_2)"></path><path mask="url(#icon_0)"></path></svg></svg>`

		expect(actual).toBe(expected)
	})

	test(`Function should update every reference within one attribute`, () => {
		let actual = build([
			{
				path: `icon.svg`,
				contents: `<svg viewBox="0 0 10 10"><mask id="a"/><path style="fill:url(#a);mask:url(#a)"/></svg>`,
			},
		])
		let expected = `<svg xmlns="http://www.w3.org/2000/svg"><style>:root svg:not(:target){display:none}</style><svg viewBox="0 0 10 10" id="icon"><mask id="icon_0"></mask><path style="fill:url(#icon_0);mask:url(#icon_0)"></path></svg></svg>`

		expect(actual).toBe(expected)
	})

	test(`Function should include all different namespaces into final svg`, () => {
		let actual = build([
			{
				path: `rect1.svg`,
				contents: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:ns1="https://example.com/ns/ns1"><rect ns1:width="50" ns1:height="10"/></svg>`,
			},
			{
				path: `rect2.svg`,
				contents: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:ns2="https://example.com/ns/ns2"><ns2:rect width="50" height="10"/></svg>`,
			},
		])
		let expected = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:ns1="https://example.com/ns/ns1" xmlns:ns2="https://example.com/ns/ns2"><style>:root svg:not(:target){display:none}</style><svg id="rect1"><rect ns1:width="50" ns1:height="10"></rect></svg><svg id="rect2"><ns2:rect width="50" height="10"></ns2:rect></svg></svg>`

		expect(actual).toBe(expected)
	})

	test(`Function should replace aliases of existing namespaces`, () => {
		let actual = build([
			{
				path: `rect1.svg`,
				contents: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:ns1="https://example.com/ns/ns1"><rect ns1:width="50" ns1:height="10"/></svg>`,
			},
			{
				path: `rect2.svg`,
				contents: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:ns2="https://example.com/ns/ns1"><ns2:rect ns2:width="50" ns2:height="10"/></svg>`,
			},
		])
		let expected = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:ns1="https://example.com/ns/ns1"><style>:root svg:not(:target){display:none}</style><svg id="rect1"><rect ns1:width="50" ns1:height="10"></rect></svg><svg id="rect2"><ns1:rect ns1:width="50" ns1:height="10"></ns1:rect></svg></svg>`

		expect(actual).toBe(expected)
	})

	test(`Function should rename duplicate aliases of different namespaces`, () => {
		let actual = build([
			{
				path: `rect1.svg`,
				contents: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:ns="https://example.com/ns/ns1"><rect ns:width="50" ns:height="10"/></svg>`,
			},
			{
				path: `rect2.svg`,
				contents: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:ns="https://example.com/ns/ns2"><rect ns:width="50" ns:height="10"/></svg>`,
			},
			{
				path: `rect3.svg`,
				contents: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:ns="https://example.com/ns/ns3"><ns:rect width="50" height="10"/></svg>`,
			},
		])
		let expected = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:ns="https://example.com/ns/ns1" xmlns:nsf37e589="https://example.com/ns/ns2" xmlns:ns8467673="https://example.com/ns/ns3"><style>:root svg:not(:target){display:none}</style><svg id="rect1"><rect ns:width="50" ns:height="10"></rect></svg><svg id="rect2"><rect nsf37e589:width="50" nsf37e589:height="10"></rect></svg><svg id="rect3"><ns8467673:rect width="50" height="10"></ns8467673:rect></svg></svg>`

		expect(actual).toBe(expected)
	})

	test(`Function should remove "http://www.w3.org/1999/xlink" namespace`, () => {
		let actual = build([
			{
				path: `burger.svg`,
				contents: `<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path id="a" d="m8 8h34" stroke="#000" stroke-width="8"/><use y="17" xlink:href="#a"/><use y="34" xlink:href="#a"/></svg>`,
			},
			{
				path: `sandwich.svg`,
				contents: `<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path id="a" d="m8 8h34" stroke="#000" stroke-width="8"/><use y="17" xlink:href="#a"/><use y="34" xlink:href="#a"/></svg>`,
			},
		])
		let expected = `<svg xmlns="http://www.w3.org/2000/svg"><style>:root svg:not(:target){display:none}</style><svg viewBox="0 0 50 50" id="burger"><path id="burger_0" d="m8 8h34" stroke="#000" stroke-width="8"></path><use y="17" href="#burger_0"></use><use y="34" href="#burger_0"></use></svg><svg viewBox="0 0 50 50" id="sandwich"><path id="sandwich_0" d="m8 8h34" stroke="#000" stroke-width="8"></path><use y="17" href="#sandwich_0"></use><use y="34" href="#sandwich_0"></use></svg></svg>`

		expect(actual).toBe(expected)
	})

	test(`Function should not add unused namespaces`, () => {
		let actual = build([
			{
				path: `rect1.svg`,
				contents: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:ns1="https://example.com/ns/ns1"><rect width="50" height="10"/></svg>`,
			},
			{
				path: `rect2.svg`,
				contents: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:ns2="https://example.com/ns/ns2"><rect width="50" height="10"/></svg>`,
			},
		])
		let expected = `<svg xmlns="http://www.w3.org/2000/svg"><style>:root svg:not(:target){display:none}</style><svg id="rect1"><rect width="50" height="10"></rect></svg><svg id="rect2"><rect width="50" height="10"></rect></svg></svg>`

		expect(actual).toBe(expected)
	})

	test(`Function should synthesize the viewBox from the width and the height`, () => {
		let actual = build([
			{
				path: `circle.svg`,
				contents: `<svg width="24" height="12"><circle cx="2" cy="2" r="1"/></svg>`,
			},
		])
		let expected = `<svg xmlns="http://www.w3.org/2000/svg"><style>:root svg:not(:target){display:none}</style><svg id="circle" viewBox="0 0 24 12"><circle cx="2" cy="2" r="1"></circle></svg></svg>`

		expect(actual).toBe(expected)
	})

	test(`Function should keep the fractional part of the width and the height`, () => {
		let actual = build([
			{
				path: `circle.svg`,
				contents: `<svg width="24.5" height="12.5"><circle cx="2" cy="2" r="1"/></svg>`,
			},
		])
		let expected = `<svg xmlns="http://www.w3.org/2000/svg"><style>:root svg:not(:target){display:none}</style><svg id="circle" viewBox="0 0 24.5 12.5"><circle cx="2" cy="2" r="1"></circle></svg></svg>`

		expect(actual).toBe(expected)
	})

	test(`Function should synthesize the viewBox from the pixel width and height`, () => {
		let actual = build([
			{
				path: `circle.svg`,
				contents: `<svg width="24px" height="12px"><circle cx="2" cy="2" r="1"/></svg>`,
			},
		])
		let expected = `<svg xmlns="http://www.w3.org/2000/svg"><style>:root svg:not(:target){display:none}</style><svg id="circle" viewBox="0 0 24 12"><circle cx="2" cy="2" r="1"></circle></svg></svg>`

		expect(actual).toBe(expected)
	})

	test(`Function should not synthesize the viewBox from context dependent units`, () => {
		let actual = build([
			{
				path: `circle.svg`,
				contents: `<svg width="1em" height="100%"><circle cx="2" cy="2" r="1"/></svg>`,
			},
		])
		let expected = `<svg xmlns="http://www.w3.org/2000/svg"><style>:root svg:not(:target){display:none}</style><svg id="circle"><circle cx="2" cy="2" r="1"></circle></svg></svg>`

		expect(actual).toBe(expected)
	})

	test(`Function should keep the existing viewBox and drop the width and the height`, () => {
		let actual = build([
			{
				path: `circle.svg`,
				contents: `<svg viewBox="0 0 4 4" width="24" height="12"><circle cx="2" cy="2" r="1"/></svg>`,
			},
		])
		let expected = `<svg xmlns="http://www.w3.org/2000/svg"><style>:root svg:not(:target){display:none}</style><svg viewBox="0 0 4 4" id="circle"><circle cx="2" cy="2" r="1"></circle></svg></svg>`

		expect(actual).toBe(expected)
	})

	test(`Function should drop the xml prolog and the comments`, () => {
		let actual = build([
			{
				path: `circle.svg`,
				contents: `<?xml version="1.0" encoding="UTF-8"?>\n<!-- Generator -->\n<svg viewBox="0 0 4 4"><circle cx="2" cy="2" r="1"/></svg>`,
			},
		])
		let expected = `<svg xmlns="http://www.w3.org/2000/svg"><style>:root svg:not(:target){display:none}</style><svg viewBox="0 0 4 4" id="circle"><circle cx="2" cy="2" r="1"></circle></svg></svg>`

		expect(actual).toBe(expected)
	})
})
