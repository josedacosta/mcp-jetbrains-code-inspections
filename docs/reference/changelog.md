---
sidebar_position: 3
title: Changelog
description: Version history and release notes
---

# Changelog

All notable changes to MCP JetBrains Code Inspections are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned Features

- Enhanced IDE detection for Toolbox installations
- Support for custom inspection scopes
- Integration with more MCP clients
- Performance optimizations for large codebases

## [1.0.0] - 2025-01-08

### Added

#### Core Architecture & Foundation

- **Application Bootstrap System**: Main application class with complete dependency injection setup and lifecycle management
- **Dependency Container**: Custom IoC container supporting singleton and transient service registration with type-safe resolution
- **Modular Architecture**: Clean separation of concerns across domain, core, infrastructure, and MCP layers following DDD principles
- **Domain-Driven Design**: Clear boundaries between business logic, infrastructure, and presentation layers

#### MCP Protocol Implementation

- **Full MCP SDK Integration**: Complete Model Context Protocol implementation with stdio transport
- **Single Tool Interface**: `get_jetbrains_code_inspections` tool accepting file or directory path parameter
- **Request Handlers**: Specialized handlers for ListTools and CallTool operations with error boundaries
- **Server Lifecycle Management**: Graceful startup/shutdown with signal handling (SIGINT, SIGTERM, uncaught exceptions)
- **Resource Management**: Automatic cleanup at startup and shutdown with temporary directory purging
- **Capability Declaration**: Proper MCP capability announcements (tools.listChanged)

#### JetBrains IDE Ecosystem Support

- **Automatic IDE Detection**: Intelligent detection of 15+ JetBrains IDEs across all major platforms
- **Comprehensive IDE Coverage**:
    - IntelliJ IDEA (Ultimate/Community/Educational)
    - WebStorm (JavaScript/TypeScript/Node.js)
    - PyCharm (Professional/Community/Educational)
    - PhpStorm (PHP/Laravel/Symfony)
    - GoLand (Go/Golang)
    - RubyMine (Ruby/Rails)
    - Rider (.NET/C#/F#/Unity)
    - CLion (C/C++/Rust via plugin)
    - DataGrip (Databases/SQL)
    - DataSpell (Data Science/Jupyter)
    - Android Studio (Android/Kotlin)
    - AppCode (iOS/macOS/Swift/Objective-C)
    - RustRover (Rust)
    - Aqua (Test Automation)
    - Writerside (Technical Documentation)

#### Inspection Engine & Execution

- **Unified Inspection Profile**: Single comprehensive profile supporting all JetBrains IDEs and programming languages
- **Isolated Execution Environment**: JVM properties (`-Didea.config.path`, `-Didea.system.path`) for conflict-free operation
- **Inspection Strategy Pattern**: Flexible execution strategy with runtime parameter configuration
- **Three-Parameter Protocol**: Proper handling of inspect.sh mandatory parameters (project, profile, output)
- **Profile Flexibility**: Support for custom profiles via path or project defaults via -e flag
- **Timeout Management**: Configurable timeout (default 120s, max 600s) with proper process termination and cleanup
- **Output Directory Isolation**: Temporary directories with unique identifiers and automatic cleanup
- **Processing Pipeline**: Parse → Filter → Normalize → Format with error recovery at each stage

#### Configuration & Environment Variables

- **Multi-Source Configuration**: Hierarchical configuration (Default → File → Environment) with intelligent merging
- **ConfigLoader Singleton**: Centralized configuration management with TTL-based caching
- **Force Override Variables** (disable auto-detection):
    - `FORCE_INSPECT_PATH`: Specify exact IDE inspect tool path
    - `FORCE_PROJECT_ROOT`: Override project root detection
    - `FORCE_PROFILE_PATH`: Use specific inspection profile
- **Inspection Control Variables**:
    - `INSPECTION_TIMEOUT`: Custom timeout in milliseconds (default: 120000)
    - `EXCLUDE_INSPECTIONS`: Comma-separated inspection codes to exclude
    - `ONLY_INSPECTIONS`: Comma-separated inspection codes to include exclusively
- **Output Control Variables**:
    - `RESPONSE_FORMAT`: Output format (`markdown` or `json`)
    - `DEBUG`: Enable verbose debug logging

#### Developer Experience & Tooling

- **TypeScript Implementation**: 100% TypeScript with strict type checking and comprehensive type definitions
- **Development Workflow**:
    - Hot reload with tsx for rapid iteration
    - Watch mode compilation for continuous feedback
    - Source maps for debugging support
- **Build System**:
    - TypeScript compilation with optimization
    - Multiple tsconfig profiles (main, scripts)
    - Clean build support with artifact removal
- **Testing Infrastructure**:
    - MCP Inspector integration (`yarn inspect`)
    - Interactive MCP test script with colored output
    - Direct IDE testing scripts
    - Version consistency checker
- **Code Quality Tools**:
    - ESLint with TypeScript rules
    - Prettier for code formatting
    - Git hooks for pre-commit checks
- **Documentation System**:
    - Docusaurus 3.x with MDX support
    - Node 20 compatibility scripts
    - Auto-generated API documentation
    - Interactive examples and guides

#### Intelligent IDE Detection & Selection

- **Smart Priority System**:
    - Primary: IntelliJ IDEA (universal support)
    - Web Development: WebStorm
    - Python: PyCharm
    - PHP: PhpStorm
    - Go: GoLand
    - Fallback cascade for remaining IDEs
- **Multi-Platform Path Resolution**:
    - **macOS**: Applications folder, Homebrew Cask, JetBrains Toolbox
    - **Linux**: Standard paths, Snap packages, Flatpak, JetBrains Toolbox
    - **Windows**: Program Files, Local AppData, JetBrains Toolbox
- **Installation Method Support**:
    - Standard installer packages
    - JetBrains Toolbox (with version detection)
    - Package managers (Homebrew, Snap, Flatpak)
    - Portable installations
- **Runtime State Detection**:
    - Process checking for running instances
    - Fallback to isolated configuration
    - Version extraction via CLI
- **Project-IDE Matching**:
    - Language-based IDE selection
    - Project type detection (Node.js, Python, Java, etc.)
    - Extension analysis for file-specific IDEs
    - Scoring algorithm for best match

#### Diagnostic Processing & Output

- **Result Parsing Engine**:
    - JSON format parsing from JetBrains output
    - Multiple file aggregation support
    - Duplicate detection and elimination
    - Format compatibility (problem_class, problemClass)
- **Diagnostic Structure**:
    - File path with normalization
    - Line, column, and length for precise location
    - Severity level (ERROR/WARNING/INFO)
    - Inspection code and display name
    - Message with detailed description
    - Category and hint metadata
    - Highlighted code elements
- **Severity Mapping System**:
    - ERROR: Compilation errors, critical issues
    - WARNING: Code smells, potential bugs
    - WEAK WARNING: Style violations, minor issues
    - INFO: Suggestions, documentation
    - TYPO: Spelling and grammar
    - Additional JetBrains-specific levels
- **Advanced Filtering**:
    - Include/exclude patterns with wildcards
    - Namespace-based filtering (e.g., TypeScript.*)
    - Severity-based filtering
    - Mutually exclusive filter modes
- **Output Formatters**:
    - **Markdown**: Rich formatting with emojis, grouping, summaries
    - **JSON**: Complete structured data with metadata preservation

#### Project Analysis & Intelligence

- **Project Type Detection**:
    - Node.js/npm (package.json)
    - Python (requirements.txt, setup.py, pyproject.toml)
    - Java/Maven/Gradle (pom.xml, build.gradle)
    - PHP/Composer (composer.json)
    - Go modules (go.mod)
    - .NET/C# (.csproj, .sln)
    - Ruby/Rails (Gemfile)
    - Rust/Cargo (Cargo.toml)
    - iOS/Swift (*.xcodeproj)
    - Android (AndroidManifest.xml)
- **Language Statistics**:
    - File extension analysis
    - Primary language determination
    - Multi-language project support
- **Project Root Discovery**:
    - Ascending directory traversal
    - Marker file detection (.idea, .git, etc.)
    - Configurable search depth
    - Cache for performance

#### Performance & Optimization

- **Caching Strategies**:
    - IDE detection results caching
    - Configuration caching with TTL
    - Project analysis caching
- **Resource Management**:
    - Automatic temporary file cleanup
    - Process lifecycle management
    - Memory-efficient file processing
    - Stream-based result parsing
- **Parallel Processing**:
    - Concurrent file analysis
    - Batch result processing
    - Async/await throughout
- **Error Recovery**:
    - Graceful degradation
    - Fallback mechanisms
    - Partial result handling
    - Timeout recovery

#### Comprehensive Documentation

- **Documentation Architecture**:
    - Docusaurus 3.x with React 19
    - Organized sidebar navigation
    - Search functionality
    - Versioned documentation
- **Getting Started Section**:
    - Prerequisites and requirements
    - Step-by-step installation
    - Quick start tutorial
    - First inspection walkthrough
- **Configuration Guides**:
    - Environment variable reference
    - MCP client setup (Claude, Continue, etc.)
    - Inspection profile customization
    - IDE-specific configurations
- **Usage Documentation**:
    - Basic usage patterns
    - Advanced filtering techniques
    - Multi-IDE workflows
    - CI/CD integration
- **Technical References**:
    - Complete API documentation
    - Architecture deep dive
    - IDE detection algorithms
    - Inspection engine internals
    - Cross-IDE equivalence tables
- **Troubleshooting Resources**:
    - Common error solutions
    - Performance optimization
    - Debugging techniques
    - FAQ section
- **Best Practices**:
    - Production deployment
    - Security considerations
    - Performance tuning
    - Team workflows

#### Error Handling & Diagnostics

- **Custom Error Hierarchy**:
    - BaseError with error codes
    - IDE-specific errors (NotFound, Execution)
    - Inspection errors (Timeout, Execution, Profile)
    - Validation errors (InvalidPath, InvalidConfig)
- **Error Recovery Strategies**:
    - Automatic retry logic
    - Fallback IDE selection
    - Partial result recovery
    - Graceful degradation
- **User-Friendly Messaging**:
    - Clear error descriptions
    - Actionable solutions
    - Contextual help links
    - Debug information when enabled

#### Security & Validation

- **Input Security**:
    - Zod schema validation for all inputs
    - Path traversal prevention
    - Command injection protection
    - File system access restrictions
- **Process Security**:
    - Isolated execution environments
    - Temporary directory isolation
    - No arbitrary code execution
    - Secure defaults
- **Data Security**:
    - No sensitive data in logs
    - Secure temporary file handling
    - Automatic cleanup of artifacts
    - Result sanitization

## Previous Versions

This is the initial release. Earlier development versions were not publicly released.

## Migration Guide

### From Development Versions

If you were using development versions:

1. Update your `.mcp.json` configuration
2. Replace any direct API calls with the new `get_jetbrains_code_inspections` tool
3. Update environment variable names to match new conventions
4. Test with your existing projects

### Breaking Changes in 1.0.0

- **Tool Interface**: Single `get_jetbrains_code_inspections` tool replaces multiple tools
- **Parameter Changes**: Only `path` parameter required, all configuration via environment variables
- **Response Format**: Standardized JSON and Markdown formats
- **Environment Variables**: New naming conventions for all configuration options

## Upgrade Instructions

### For New Installations

Follow the [Installation Guide](../getting-started/installation.md).

### For Existing Users

1. **Update Dependencies**:
   ```bash
   yarn install
   yarn build
   ```

2. **Update Configuration**:
   ```json
   {
     "mcpServers": {
       "jetbrains-inspections": {
         "command": "node",
         "args": ["./dist/index.js"],
         "env": {
           "INSPECTION_TIMEOUT": "300000",
           "RESPONSE_FORMAT": "json"
         }
       }
     }
   }
   ```

3. **Test Setup**:
   ```bash
   yarn inspect
   # Or use MCP Inspector to test functionality
   ```

## Support

### Reporting Issues

- **GitHub Issues**: [Report bugs and request features](https://github.com/josedacosta/mcp-jetbrains-code-inspections/issues)
- **Discussions**: [Community discussions and questions](https://github.com/josedacosta/mcp-jetbrains-code-inspections/discussions)

### Getting Help

- **Documentation**: Complete guides in the [documentation site](../index.md)
- **Troubleshooting**: [Common issues and solutions](../guides/troubleshooting.md)
- **Best Practices**: [Production usage patterns](../guides/best-practices.md)

## Contributing

We welcome contributions! See our [Contributing Guide](./contributing.md) for details on:

- Code contributions
- Documentation improvements
- Bug reports and feature requests
- Community guidelines

## License

This project is licensed under the Open Software License 3.0 (OSL-3.0). See
the [LICENSE](https://github.com/josedacosta/mcp-jetbrains-code-inspections/blob/main/LICENSE) file for details.

## Acknowledgments

- **JetBrains**: For creating the excellent IDEs and inspection engine
- **Model Context Protocol**: For the protocol specification and SDK
- **Community Contributors**: Thank you to all who helped test and improve this project

---

For the most up-to-date information, visit our [GitHub repository](https://github.com/josedacosta/mcp-jetbrains-code-inspections).
