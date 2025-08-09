---
sidebar_position: 1
title: Configuration
description: Configure MCP JetBrains Code Inspections for your environment
---

# Configuration Overview

MCP JetBrains Code Inspections offers flexible configuration options to customize its behavior for your specific needs.

## Configuration Topics

### [Environment Variables](./environment-variables)

Complete guide to all environment variables:

- Path configuration options
- Execution parameters
- Filter settings
- Output format control

### [MCP Setup](./mcp-setup)

Learn how to configure the MCP server:

- Server setup in MCP clients
- Platform-specific configuration
- Development vs production setup
- Multiple server configurations

### [Inspection Profiles](./inspection-profiles)

Master inspection profile configuration:

- Using default profiles
- Creating custom profiles
- Profile precedence
- Cross-IDE compatibility

## Quick Configuration Example

```json
{
    "mcpServers": {
        "jetbrains-inspections": {
            "command": "node",
            "args": ["./dist/index.js"],
            "env": {
                "INSPECTION_TIMEOUT": "300000",
                "FORCE_INSPECT_PATH": "/custom/path/to/inspect.sh"
            }
        }
    }
}
```

## Configuration Best Practices

1. **Start with Defaults**: The default configuration works well for most projects
2. **Adjust Timeouts**: Increase timeout for large codebases
3. **Use Appropriate Verbosity**: Higher verbosity provides more details but takes longer
4. **Maintain Profiles**: Keep inspection profiles in version control
5. **Test Changes**: Verify configuration changes with test files

## Environment Variables Reference

| Variable              | Default       | Description                                 |
| --------------------- | ------------- | ------------------------------------------- |
| `FORCE_INSPECT_PATH`  | Auto-detected | Force specific IDE inspect tool path        |
| `FORCE_PROJECT_ROOT`  | Auto-detected | Force project root directory                |
| `FORCE_PROFILE_PATH`  | Auto-detected | Force inspection profile path               |
| `INSPECTION_TIMEOUT`  | 120000        | Timeout in milliseconds                     |
| `EXCLUDE_INSPECTIONS` | -             | Comma-separated inspection codes to exclude |
| `ONLY_INSPECTIONS`    | -             | Comma-separated inspection codes to include |
| `RESPONSE_FORMAT`     | markdown      | Output format: 'markdown' or 'json'         |
| `DEBUG`               | false         | Enable debug logging ('true' to enable)     |

## Configuration Files

The server looks for configuration in these locations:

1. Environment variables (highest priority)
2. MCP client configuration
3. Project inspection profiles
4. IDE default settings

Continue to specific configuration topics:

- [Environment Variables](./environment-variables) for detailed configuration options
- [MCP Setup](./mcp-setup) for server setup
- [Inspection Profiles](./inspection-profiles) for code analysis rules
