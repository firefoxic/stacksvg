<!-- markdownlint-disable MD007 MD024 -->
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com), and this project adheres to [Semantic Versioning](https://semver.org).

## [Unreleased]

### Changed

- The project [`gulp-stacksvg`](https://github.com/firefoxic/gulp-stacksvg/) is forked with the name `@firefoxic/stacksvg`.
- The `@firefoxic/stacksvg` package is no longer dependent on gulp. Instead, it exposes a Node API: `stacksvg(sources)` returns a sprite, and the `StackSvgCreator` class builds it incrementally as sources arrive.
- Empty elements in the stack are now self-closing, so the sprite no longer carries the closing tags it does not need.

### Added

- The package now ships a `stacksvg` command line, so a stack can be built straight from the matched svg files with no build tool in the way.

[Unreleased]: https://github.com/firefoxic/stacksvg/compare/v0.0.0...HEAD
