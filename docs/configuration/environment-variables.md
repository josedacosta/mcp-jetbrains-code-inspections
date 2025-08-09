---
sidebar_position: 2
title: Environment Variables
description: Configuration through environment variables
---

# Environment Variables Configuration

Environment variables provide the primary way to configure MCP JetBrains Code Inspections.

## Quick Reference

The most commonly used environment variables:

- `INSPECTION_TIMEOUT` - Set inspection timeout (default: 120000ms)
- `EXCLUDE_INSPECTIONS` - Exclude specific inspections
- `RESPONSE_FORMAT` - Choose output format (markdown/json)
- `DEBUG` - Enable debug logging

## Basic Usage

Configure environment variables in your `.mcp.json` file:

```json
{
    "mcpServers": {
        "mcp-jetbrains-code-inspections": {
            "command": "node",
            "args": ["./dist/index.js"],
            "env": {
                "INSPECTION_TIMEOUT": "180000",
                "EXCLUDE_INSPECTIONS": "SpellCheckingInspection",
                "RESPONSE_FORMAT": "markdown"
            }
        }
    }
}
```

## Common Configurations

### Increase Timeout for Large Projects

```json
{
    "env": {
        "INSPECTION_TIMEOUT": "300000" // 5 minutes
    }
}
```

### Exclude Noisy Inspections

```json
{
    "env": {
        "EXCLUDE_INSPECTIONS": "SpellCheckingInspection,TodoComment"
    }
}
```

### Force Specific IDE

```json
{
    "env": {
        "FORCE_INSPECT_PATH": "/Applications/WebStorm.app/Contents/bin/inspect.sh"
    }
}
```

### Enable Debugging

```json
{
    "env": {
        "DEBUG": "true"
    }
}
```

## Complete Reference

For a complete list of all environment variables with detailed descriptions, types, defaults, and advanced usage examples, see the \* \*[Environment Variables Reference](../reference/environment-variables.md)\*\*.

## See Also

- [Configuration Overview](./index.md)
- [MCP Setup](./mcp-setup.md)
- [Inspection Profiles](./inspection-profiles.md)
- [Troubleshooting Guide](../guides/troubleshooting.md)
