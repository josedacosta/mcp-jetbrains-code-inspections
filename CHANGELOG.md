# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-01-09

### 🎉 Initial Release

This is the first stable release of MCP JetBrains Code Inspections server.

### Added

#### Core Architecture & Dependency Injection

- **Application Bootstrap System**: Main application class with complete dependency injection setup
- **Dependency Container**: Custom IoC container with singleton and transient service management
- **Modular Architecture**: Clean separation of concerns with domain, core, infrastructure, and MCP layers

#### MCP Server Implementation

- **Full MCP Protocol Support**: Complete Model Context Protocol SDK integration with stdio transport
- **Single Tool Interface**: `get_jetbrains_code_inspections` tool accepting file or directory path parameter
- **Request Handlers**: Specialized handlers for ListTools and CallTool operations
- **Server Lifecycle Management**: Graceful startup/shutdown with signal handling (SIGINT, SIGTERM)
- **Automatic Cleanup**: Resource cleanup at startup and shutdown
- **Error Recovery**: Robust error handling with structured error responses

#### JetBrains IDE Integration

- **Automatic IDE Detection**: Smart detection of 15+ JetBrains IDEs across all platforms
- **Multi-Platform Support**: Windows, macOS, Linux with platform-specific path resolution
- **IDE Priority System**: IntelliJ IDEA → WebStorm → PyCharm → PhpStorm → GoLand → Others
- **Supported IDEs**:
    - IntelliJ IDEA (Universal/Community/Ultimate)
    - WebStorm (JavaScript/TypeScript)
    - PyCharm (Python Professional/Community)
    - PhpStorm (PHP)
    - GoLand (Go)
    - Rider (.NET/C#)
    - CLion (C/C++)
    - RubyMine (Ruby/Rails)
    - DataGrip (Databases/SQL)
    - DataSpell (Data Science)
    - Android Studio (Android)
    - AppCode (iOS/macOS)
    - RustRover (Rust)
    - Aqua (Test Automation)
    - Writerside (Documentation)
- **Installation Methods Support**: Standard, Toolbox, Homebrew, Snap, Flatpak
- **Running Instance Detection**: Avoids conflicts with open IDEs
- **Isolated Configuration**: Uses `-Didea.config.path` and `-Didea.system.path` JVM properties
- **Version Detection**: Automatic IDE version extraction via command line

#### Inspection Engine

- **Unified Inspection Profile**: Single profile working across all IDEs and languages
- **Inspection Strategy Pattern**: Flexible execution strategy with configurable parameters
- **Command Construction**: Intelligent inspect.sh argument building with 3 mandatory parameters
- **Profile Management**: Support for custom profiles or project defaults (-e flag)
- **Timeout Handling**: Configurable timeout (default 120s, max 600s) with proper process termination
- **Temporary Directory Management**: Isolated output directories with automatic cleanup
- **Result Processing Pipeline**: Parse → Filter → Normalize → Format

#### Diagnostic Processing

- **JSON Result Parser**: Parses JetBrains JSON output with duplicate detection
- **Severity Mapping**: Maps 9+ JetBrains severity levels to standard ERROR/WARNING/INFO
- **Diagnostic Normalization**: Path normalization and placeholder resolution ($PROJECT_DIR$, $MODULE_DIR$)
- **Advanced Filtering**: Include/exclude patterns with wildcards and namespace support
- **Diagnostic Builder**: Type-safe construction with validation
- **Result Aggregation**: Summary statistics with error/warning/info counts

#### Project Analysis

- **Project Type Detection**: Automatic detection of 10+ project types
- **Language Detection**: Statistical analysis of file extensions to determine primary language
- **Project Root Discovery**: Ascending search for project markers (.idea, .git, package.json, etc.)
- **File Type Analysis**: Extension-based language identification
- **Smart IDE Selection**: Scoring system matching IDE capabilities to project requirements

#### Configuration System

- **ConfigLoader Singleton**: Centralized configuration management with caching
- **Multi-Source Configuration**: Default → File (.mcp-jetbrains.json) → Environment variables
- **Environment Variables**:
    - `FORCE_INSPECT_PATH`: Override IDE detection
    - `FORCE_PROJECT_ROOT`: Override project root
    - `FORCE_PROFILE_PATH`: Override inspection profile
    - `INSPECTION_TIMEOUT`: Custom timeout (ms)
    - `EXCLUDE_INSPECTIONS`: Comma-separated exclusions
    - `ONLY_INSPECTIONS`: Comma-separated inclusions
    - `RESPONSE_FORMAT`: markdown/json output
    - `DEBUG`: Enable debug logging
    - `LOG_LEVEL`: DEBUG/INFO/WARN/ERROR

#### Output Formatting

- **Markdown Formatter**: Rich formatting with emojis, grouping by severity and file
- **JSON Formatter**: Complete structured data with all metadata
- **Summary Generation**: Detailed statistics and issue counts
- **Location Information**: Precise line, column, and length data
- **Highlighted Elements**: Support for JetBrains highlighted code elements
- **Category Support**: Inspection categories and hints

#### Filesystem Management

- **TempManager**: Temporary directory lifecycle with auto-cleanup (24h default)
- **ProjectScanner**: Project structure analysis with marker detection
- **Path Resolution**: Cross-platform path normalization and expansion
- **Permission Handling**: Graceful handling of access errors

#### Logging System

- **Multi-Level Logger**: DEBUG, INFO, WARN, ERROR with contextual information
- **JSON Formatting**: Structured logging for data objects
- **Error Stack Traces**: Complete error information with stack traces
- **MCP Compatibility**: stderr output for MCP protocol compliance
- **Contextual Logging**: Per-component logger instances

#### Error Handling

- **Custom Error Hierarchy**: BaseError → IDEErrors/InspectionErrors
- **Specialized Error Types**:
    - IDENotFoundError
    - IDEExecutionError
    - InspectionTimeoutError
    - InspectionExecutionError
    - ProfileNotFoundError
    - InvalidPathError
- **Error Recovery**: Fallback strategies and graceful degradation
- **User-Friendly Messages**: Clear error descriptions with actionable solutions

#### Developer Tools

- **TypeScript Support**: Full TypeScript implementation with strict type checking
- **Build System**: Compilation with watch mode for development
- **Hot Reload**: Development mode with tsx for instant feedback
- **MCP Inspector**: Interactive testing interface (`yarn inspect`)
- **Test Scripts**: Interactive MCP testing and version consistency checks
- **Git Hooks**: Automated checks via install-hooks.sh
- **Documentation Build**: Docusaurus with Node 20 compatibility scripts

#### Testing & Validation

- **Interactive Test Script**: Complete MCP protocol testing with colored output
- **Version Consistency Check**: Ensures version alignment across package.json and changelogs
- **Zod Schema Validation**: Runtime parameter validation for tool inputs
- **Input Sanitization**: Path validation and security checks

#### Documentation

- **Docusaurus Site**: Complete documentation with sidebar navigation
- **Getting Started Guides**: Prerequisites, installation, quick start
- **Configuration Documentation**: Environment variables and MCP setup
- **Technical Documentation**: Architecture, IDE detection, inspection engine
- **API Reference**: Complete tool and parameter documentation
- **Troubleshooting Guide**: Common issues and solutions
- **Best Practices**: Production usage patterns
- **IDE Equivalence Documentation**: Cross-IDE inspection consistency

### Security

- **Input Validation**: Zod schema validation for all tool parameters
- **Path Sanitization**: Secure file path handling and validation
- **No Code Execution**: Results are data-only, no arbitrary code execution
- **Isolated Execution**: Temporary directories with restricted scope
- **Process Isolation**: Separate configuration paths prevent IDE conflicts
- **Secure Defaults**: Conservative timeout and filtering defaults
