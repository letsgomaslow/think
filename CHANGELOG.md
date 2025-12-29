# Changelog

All notable changes to think-mcp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-12-28

### Changed

- **Package Renamed**: `clear-thought-mcp-server` is now `think-mcp`
- **Tool Names Simplified**: All 11 tools renamed for clarity:
  - `sequentialthinking` → `trace`
  - `mentalmodel` → `model`
  - `designpattern` → `pattern`
  - `programmingparadigm` → `paradigm`
  - `debuggingapproach` → `debug`
  - `collaborativereasoning` → `council`
  - `decisionframework` → `decide`
  - `metacognitivemonitoring` → `reflect`
  - `scientificmethod` → `hypothesis`
  - `structuredargumentation` → `debate`
  - `visualreasoning` → `map`

### Added

- Modernized SDK implementation with @modelcontextprotocol/sdk
- Enhanced trace tool with thought branching and revision support
- Session tracking for multi-turn interactions
- Comprehensive evaluation framework with semantic quality testing

### Fixed

- Response format standardization across all tools
- Improved input validation and error messages

## [1.1.2] - 2025-05-15

### Fixed

- Fixed double-wrapping issue in model tool handler

## [1.1.1] - 2025-05-15

### Fixed

- Fixed content type validation error in all tool handlers

## [1.1.0] - 2025-05-15

### Added

- Metacognitive Monitoring tool (now `reflect`)
- Scientific Method tool (now `hypothesis`)
- Structured Argumentation tool (now `debate`)
- Visual Reasoning tool (now `map`)

## [1.0.0] - 2025-05-15

### Added

- Initial release with 7 core reasoning tools
- TypeScript implementation with full type safety
- MCP SDK integration with stdio transport
