import { StackSvgCreator } from "./svg-processor.ts"

/**
 * An SVG source file to combine into a stack sprite.
 */
export interface SvgSource {

	/**
	 * Path of the file, used to derive the fragment id.
	 *
	 * Directory separators become underscores, whitespace becomes hyphens and the extension is dropped, the way a path relative to the icons directory reads.
	 */
	path: string,

	/**
	 * Content of the SVG file.
	 */
	contents: string,
}

export { StackSvgCreator }

/**
 * Combine SVG sources into a single stack sprite.
 *
 * Content holding no `svg` element is skipped silently. When no source yields an `svg` element the sprite is empty and `null` is returned.
 *
 * @param {SvgSource[]} sources - SVG sources to combine.
 * @returns {string|null} Stack sprite content or null if empty.
 */
export function stacksvg (sources: SvgSource[]): string | null {
	let processor = new StackSvgCreator()

	for (let source of sources) processor.add(source.contents, source.path)

	return processor.getStackSprite()
}
