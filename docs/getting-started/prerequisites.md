---
sidebar_position: 2
title: Prerequisites
description: System requirements and dependencies needed before installation
---

# Prerequisites

Before using MCP JetBrains Code Inspections, ensure your system meets these requirements.

## System Requirements

### Operating System

- **macOS**: 10.15 (Catalina) or later
- **Windows**: Windows 10 or later
- **Linux**: Ubuntu 18.04+, Debian 10+, Fedora 32+, or equivalent

### Software Requirements

#### Node.js

- **Version**: 20.0.0 or higher
- **Verification**: Run `node --version`
- **Installation**: Download from [nodejs.org](https://nodejs.org/)

#### JetBrains IDE

At least one of the following IDEs must be installed:

| IDE               | Supported Languages/Frameworks              |
| ----------------- | ------------------------------------------- |
| **IntelliJ IDEA** | Java, Kotlin, Scala, Groovy                 |
| **WebStorm**      | JavaScript, TypeScript, React, Vue, Angular |
| **PyCharm**       | Python, Django, Flask                       |
| **PhpStorm**      | PHP, Laravel, Symfony                       |
| **GoLand**        | Go                                          |
| **RubyMine**      | Ruby, Rails                                 |
| **CLion**         | C, C++, Rust                                |
| **DataGrip**      | SQL, Database                               |
| **Rider**         | .NET, C#, F#                                |

### IDE Configuration

#### Command Line Support

Your JetBrains IDE must have command-line launcher installed:

**macOS/Linux:**

```bash
# Check if inspect tool is available
ls /Applications/[YourIDE].app/Contents/bin/inspect.sh
```

**Windows:**

```cmd
# Check in installation directory
dir "C:\Program Files\JetBrains\[YourIDE]\bin\inspect.bat"
```

#### Installing Command Line Tools

1. Open your JetBrains IDE
2. Go to **Tools** → **Create Command-line Launcher** (macOS/Linux)
3. Or during installation, select "Add launchers dir to the PATH" (Windows)

### MCP Client Requirements

To use this server, you need an MCP-compatible client:

- **Claude Code** (Anthropic's official CLI)
- Any other MCP-compliant client

## Hardware Requirements

### Minimum

- **RAM**: 4GB (8GB recommended)
- **Disk Space**: 500MB for the server + space for inspection results
- **CPU**: Any modern processor (2+ cores recommended)

### Recommended for Large Projects

- **RAM**: 16GB or more
- **SSD**: For faster file analysis
- **CPU**: 4+ cores for parallel inspections

## Project Requirements

### Project Structure

Your project should have:

- A `.idea` directory (created by JetBrains IDE)
- Proper project configuration for your language/framework
- Valid source files in supported languages

### Inspection Profiles

- Default profiles work out of the box
- Custom profiles can be created in the IDE
- Profiles are stored in `.idea/inspectionProfiles/`

## Environment Setup

### Environment Variables (Optional)

These can be configured in your `.mcp.json` file:

```bash
# Increase timeout for large projects (milliseconds)
export INSPECTION_TIMEOUT=300000

# Force specific IDE path (if not auto-detected)
export FORCE_INSPECT_PATH="/path/to/inspect.sh"

# Force project root directory (disables auto-detection)
export FORCE_PROJECT_ROOT="/path/to/project"

# Force inspection profile path (disables default profile detection)
export FORCE_PROFILE_PATH="/path/to/profile.xml"

# Comma-separated inspection codes to exclude
export EXCLUDE_INSPECTIONS="UnusedDeclaration,TypeScriptValidateTypes"

# Comma-separated inspection codes to include only
export ONLY_INSPECTIONS="UnusedDeclaration,DuplicatedCode"

# Output format: 'markdown' or 'json' (default: 'markdown')
export RESPONSE_FORMAT="json"

# Enable debug logging ('true' to enable)
export DEBUG="true"
```

### File Permissions

Ensure the current user has:

- Read access to project files
- Write access to temp directory for results
- Execute permission for IDE inspect tool

## Verification Checklist

Before proceeding with installation:

- [ ] Node.js 20+ is installed
- [ ] At least one JetBrains IDE is installed
- [ ] IDE has been opened at least once
- [ ] Command-line tools are accessible
- [ ] Project has `.idea` directory
- [ ] Sufficient disk space available

## Common Issues

### IDE Not Found

If the server can't find your IDE:

1. Check IDE is properly installed
2. Verify installation path
3. Set `FORCE_INSPECT_PATH` environment variable

### Permission Denied

If you get permission errors:

1. Check file permissions
2. Run with appropriate user privileges
3. Ensure temp directory is writable

## Next Steps

Once all prerequisites are met:

- Proceed to [Installation](./installation)
- Or jump to [Quick Start](./quick-start) if already installed
