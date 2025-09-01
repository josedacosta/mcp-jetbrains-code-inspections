---
sidebar_position: 4
title: Environment Variables Reference
description: Complete reference for all environment variables
---

# Environment Variables Reference

This is the complete reference for all environment variables supported by MCP JetBrains Code Inspections.

## Configuration Hierarchy

Variables can be configured in three ways, listed by priority:

1. **System Environment Variables** (highest priority)
2. **MCP Configuration File** (`.mcp.json`)
3. **Default Values** (lowest priority)

## Variable Categories

### Path Override Variables

These variables force specific paths and disable auto-detection:

#### `FORCE_INSPECT_PATH`

- **Type**: `string`
- **Default**: Auto-detected
- **Description**: Force specific IDE inspect tool path (disables auto-detection)
- **Example**: `/Applications/IntelliJ IDEA.app/Contents/bin/inspect.sh`

#### `FORCE_PROJECT_ROOT`

- **Type**: `string`
- **Default**: Auto-detected
- **Description**: Force project root directory (disables auto-detection)
- **Example**: `/Users/myuser/projects/myproject`

#### `FORCE_PROFILE_PATH`

- **Type**: `string`
- **Default**: Project defaults via `-e` flag
- **Description**: Force inspection profile path (disables project defaults)
- **Example**: `/path/to/custom/profile.xml`
- **Note**: When not specified, the system uses the `-e` flag for project default inspections

### Execution Configuration

#### `INSPECTION_TIMEOUT`

- **Type**: `number` (milliseconds)
- **Default**: `120000` (2 minutes)
- **Maximum**: `600000` (10 minutes)
- **Description**: Timeout for inspection execution
- **Recommended Values**:
    - Small projects: `60000` (1 minute)
    - Medium projects: `120000` (2 minutes)
    - Large projects: `300000` (5 minutes)
    - Very large projects: `600000` (10 minutes)

### Filter Configuration

#### `EXCLUDE_INSPECTIONS`

- **Type**: `string` (comma-separated)
- **Default**: `SpellCheckingInspection`
- **Description**: Comma-separated inspection codes to exclude
- **Example**: `SpellCheckingInspection,TodoComment,UnusedDeclaration`
- **Note**: Takes precedence over severity filtering

#### `ONLY_INSPECTIONS`

- **Type**: `string` (comma-separated)
- **Default**: None
- **Description**: Comma-separated inspection codes to include exclusively
- **Example**: `TypeScriptValidateTypes,ESLintInspection`
- **Note**: When specified, only these inspections will run (mutually exclusive with EXCLUDE_INSPECTIONS)

### Output Configuration

#### `RESPONSE_FORMAT`

- **Type**: `string`
- **Values**: `markdown` | `json`
- **Default**: `markdown`
- **Description**: Output format for diagnostics
- **Use Cases**:
    - `markdown`: Human-readable format with emojis and grouping
    - `json`: Machine-readable format for programmatic processing

### Debugging Configuration

#### `DEBUG`

- **Type**: `boolean` (string representation)
- **Values**: `true` | `false`
- **Default**: `false`
- **Description**: Enable debug logging to stderr
- **Note**: Useful for troubleshooting IDE detection and inspection execution

## Configuration Examples

### Basic Configuration in `.mcp.json`

```json
{
    "mcpServers": {
        "mcp-jetbrains-code-inspections": {
            "command": "node",
            "args": ["./dist/index.js"],
            "env": {
                "INSPECTION_TIMEOUT": "180000",
                "EXCLUDE_INSPECTIONS": "SpellCheckingInspection,TodoComment",
                "RESPONSE_FORMAT": "json"
            }
        }
    }
}
```

### Force Specific IDE

```json
{
    "env": {
        "FORCE_INSPECT_PATH": "/Applications/WebStorm.app/Contents/bin/inspect.sh",
        "FORCE_PROJECT_ROOT": "/Users/myuser/projects/webapp"
    }
}
```

### Custom Profile with Filters

```json
{
    "env": {
        "FORCE_PROFILE_PATH": "/path/to/strict-profile.xml",
        "ONLY_INSPECTIONS": "TypeScriptValidateTypes,UnusedDeclaration",
        "INSPECTION_TIMEOUT": "300000"
    }
}
```

### Debug Configuration

```json
{
    "env": {
        "DEBUG": "true",
        "RESPONSE_FORMAT": "json"
    }
}
```

## Precedence Rules

1. **ONLY_INSPECTIONS** takes precedence over EXCLUDE_INSPECTIONS
2. **FORCE\_\* variables** disable all auto-detection for their respective features
3. **System environment variables** override MCP configuration file values
4. **Timeout** is capped at 600000ms (10 minutes) regardless of configuration

## Best Practices

1. **Use FORCE\_\* sparingly**: Auto-detection usually selects the best IDE
2. **Start with default timeout**: Increase only if inspections are timing out
3. **Be selective with filters**: Too many exclusions may miss important issues
4. **Use markdown for humans**: JSON format is better for automated processing
5. **Enable DEBUG only when troubleshooting**: It produces verbose output

## Troubleshooting

### Common Issues

**Inspections timing out:**

- Increase `INSPECTION_TIMEOUT` value
- Consider using `ONLY_INSPECTIONS` to run fewer checks

**Wrong IDE being selected:**

- Use `FORCE_INSPECT_PATH` to specify exact IDE
- Enable `DEBUG` to see IDE detection process

**Too many false positives:**

- Use `EXCLUDE_INSPECTIONS` to filter out noisy inspections
- Consider creating a custom profile

**No inspections running:**

- Check if `ONLY_INSPECTIONS` is too restrictive
- Verify profile path with `FORCE_PROFILE_PATH`
- Enable `DEBUG` to see execution details

## See Also

- [Configuration Overview](../configuration/index.md)
- [MCP Setup Guide](../configuration/mcp-setup.md)
- [Inspection Profiles](../configuration/inspection-profiles.md)
- [Troubleshooting Guide](../guides/troubleshooting.md)
