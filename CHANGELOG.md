<!-- markdownlint-disable MD007 MD024 -->
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com), and this project adheres to [Semantic Versioning](https://semver.org).

## [Unreleased]

### Changed

- The project [`gulp-stacksvg`](https://github.com/firefoxic/gulp-stacksvg/) is forked with the name `@firefoxic/stacksvg`.
- The `@firefoxic/stacksvg` package is no longer dependent on gulp. Instead, it exposes a Node API: `stacksvg(sources)` returns a sprite, and the `StackSvgCreator` class builds it incrementally as sources arrive.

[Unreleased]: https://github.com/firefoxic/stacksvg/compare/v0.0.0...HEAD
