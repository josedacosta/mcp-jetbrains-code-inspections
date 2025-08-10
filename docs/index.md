---
sidebar_position: 1
slug: /
---

<div align="center">
  <img src="/mcp-jetbrains-code-inspections/img/logo.svg" alt="MCP JetBrains Code Inspections" width="120" height="120" />
</div>

# MCP JetBrains Code Inspections

> ## ⚠️ Deprecated Notice
>
> [![Status: Deprecated](https://img.shields.io/badge/Status-Deprecated-red.svg)](https://github.com/josedacosta/mcp-jetbrains-code-inspections#deprecated-notice)
>
> **This project is deprecated but still functional.** Starting from version 2025.2, JetBrains IDEs now include a built-in MCP server.
> 
> **Recommended alternatives:**
> - JetBrains IDE 2025.2+: [Built-in MCP server](https://www.jetbrains.com/help/webstorm/mcp-server.html)
> - Earlier versions: [JetBrains MCP plugin](https://plugins.jetbrains.com/plugin/26071-mcp-server)
> 
> **See our [migration guide](./deprecated/jetbrains-native-mcp) for details.**

A Model Context Protocol (MCP) server that enables running JetBrains IDE code inspections with automatic IDE selection.

## Overview

MCP JetBrains Code Inspections provides a bridge between the MCP protocol and the powerful code inspection capabilities of JetBrains IDEs. It
automatically
detects the appropriate IDE installed on your system and uses it to analyze your code.

## 🚀 Key Features

- **🔍 Comprehensive Inspections**: Access all JetBrains inspections (not just TypeScript)
- **🎯 Automatic IDE Selection**: Detects and uses the best available IDE
- **📊 Multiple Formats**: Supports JSON, XML and plain text
- **⚡ Optimized Performance**: Configurable timeout for large projects
- **🔧 Customizable Profiles**: Use your own inspection profiles
- **🌐 Multi-Language**: Supports all JetBrains IDE languages

## 📚 Documentation

### Getting Started

- **[Prerequisites](./getting-started/prerequisites)** - What you need before installation
- **[Installation](./getting-started/installation)** - Step-by-step installation guide
- **[Quick Start](./getting-started/quick-start)** - Your first inspection in 2 minutes

### Configuration

- **[Overview](./configuration/)** - Available configuration options
- **[MCP Setup](./configuration/mcp-setup)** - Configure the MCP server
- **[Environment Variables](./configuration/environment-variables)** - All configuration options
- **[Inspection Profiles](./configuration/inspection-profiles)** - Manage profiles

### Practical Guides

- **[Multi-IDE Usage](./guides/multi-ide-usage)** - Using different IDEs
- **[Testing](./guides/testing)** - How to test your setup
- **[Troubleshooting](./guides/troubleshooting)** - Solving common problems
- **[Best Practices](./guides/best-practices)** - Production usage patterns

### Technical Documentation

- **[Architecture](./technical/architecture)** - System design
- **[API Reference](./usage/api-reference)** - Complete API documentation

## 💡 Quick Example

```javascript
// Analyze a TypeScript file
const diagnostics = await get_jetbrains_code_inspections({
    path: '/src/app.ts',
});

// Analyze a directory
const results = await get_jetbrains_code_inspections({
    path: '/src/components/',
});
```

**Configuration via environment variables:**

```bash
# Configure response format and exclusions
export RESPONSE_FORMAT="json"
export EXCLUDE_INSPECTIONS="SpellCheckingInspection,TodoComment"
export INSPECTION_TIMEOUT="180000"
```

## 🛠️ Supported IDEs

The following JetBrains IDEs are fully supported:

- **IntelliJ IDEA** - Java, Kotlin, Scala, Groovy
- **WebStorm** - JavaScript, TypeScript, HTML, CSS, Vue, React
- **PyCharm** - Python, Django, Flask
- **PhpStorm** - PHP, Laravel, Symfony
- **GoLand** - Go, Golang
- **RubyMine** - Ruby, Rails
- **CLion** - C, C++, Rust (via plugin)
- **Rider** - .NET, C#, F#, Unity
- **DataGrip** - SQL, Databases
- **DataSpell** - Data Science, Jupyter Notebooks
- **AppCode** - iOS, macOS, Swift, Objective-C
- **Android Studio** - Android, Kotlin
- **RustRover** - Rust
- **Aqua** - Test Automation
- **Writerside** - Technical Documentation

## 🤝 Contributing

Contributions are welcome! Check out
our [contribution guide](https://github.com/josedacosta/mcp-jetbrains-code-inspections/blob/main/CONTRIBUTING.md).

## 📝 License

This project is licensed under OSL-3.0 (Open Software License 3.0). See the
[LICENSE](https://github.com/josedacosta/mcp-jetbrains-code-inspections/blob/main/LICENSE) file for more details.

## 🔗 Useful Links

- [GitHub Repository](https://github.com/josedacosta/mcp-jetbrains-code-inspections)
- [Report an Issue](https://github.com/josedacosta/mcp-jetbrains-code-inspections/issues)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [JetBrains IDEs](https://www.jetbrains.com/)
