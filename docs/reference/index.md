---
sidebar_position: 1
title: Reference
description: Complete reference materials and external resources
---

# Reference Documentation

Complete reference materials for MCP JetBrains Code Inspections.

## Reference Topics

### [API Reference](../usage/api-reference)

Complete API documentation:

- Tool specifications
- Parameter schemas
- Response formats
- Error codes

### [Changelog](./changelog)

Version history and release notes:

- Feature additions
- Bug fixes
- Breaking changes
- Migration guides

## Quick Reference

### get_jetbrains_code_inspections Parameters

| Parameter | Type   | Required | Default | Description                  |
| --------- | ------ | -------- | ------- | ---------------------------- |
| `path`    | string | ✓        | -       | File or directory to analyze |

### Configuration Environment Variables

| Variable              | Type              | Default  | Description                          |
| --------------------- | ----------------- | -------- | ------------------------------------ |
| `FORCE_INSPECT_PATH`  | string            | -        | Force specific IDE inspect tool path |
| `FORCE_PROJECT_ROOT`  | string            | -        | Force project root directory         |
| `FORCE_PROFILE_PATH`  | string            | -        | Force inspection profile path        |
| `INSPECTION_TIMEOUT`  | number            | 120000   | Timeout in milliseconds              |
| `EXCLUDE_INSPECTIONS` | string (csv)      | -        | Inspection codes to exclude          |
| `ONLY_INSPECTIONS`    | string (csv)      | -        | Only include these inspection codes  |
| `RESPONSE_FORMAT`     | "markdown"/"json" | markdown | Output format                        |
| `DEBUG`               | "true"/"false"    | false    | Enable debug logging                 |

### Severity Mappings

| JetBrains    | MCP/LSP     | Numeric | Description     |
| ------------ | ----------- | ------- | --------------- |
| ERROR        | Error       | 1       | Must fix        |
| WARNING      | Warning     | 2       | Should fix      |
| WEAK WARNING | Information | 3       | Consider fixing |
| INFO         | Hint        | 4       | Suggestion      |

### Environment Variables

```bash
# Timeout configuration (milliseconds)
INSPECTION_TIMEOUT=120000

# Force specific IDE path
FORCE_INSPECT_PATH="/path/to/inspect.sh"

# Force project root
FORCE_PROJECT_ROOT="/path/to/project"

# Force profile path
FORCE_PROFILE_PATH="/path/to/profile.xml"

# Filter inspections
EXCLUDE_INSPECTIONS="UnusedDeclaration,SpellCheckingInspection"
ONLY_INSPECTIONS="NullableProblems,UnusedVariable"

# Output format
RESPONSE_FORMAT="markdown"

# Debug mode
DEBUG="true"
```

### File Path Format

```
/absolute/path/to/file.ext
C:\Windows\path\to\file.ext  # Windows
/relative/path/to/file.ext   # Relative paths also supported
```

## Error Reference

### Common Error Codes

| Code            | Message                | Solution                  |
| --------------- | ---------------------- | ------------------------- |
| `IDE_NOT_FOUND` | No JetBrains IDE found | Install IDE or set path   |
| `TIMEOUT`       | Operation timed out    | Increase timeout          |
| `INVALID_URI`   | Invalid file URI       | Check URI format          |
| `NO_PROFILE`    | Profile not found      | Create inspection profile |

### Exit Codes

- `0` - Success
- `1` - General error
- `2` - IDE not found
- `3` - Timeout
- `124` - Command timeout

## Configuration Files

### MCP Configuration

Location: `.mcp-diagnostics.json` or `mcp.json`

### Inspection Profiles

Location: `.idea/inspectionProfiles/`

### IDE Settings

Location: `.idea/` directory

## Supported File Types

All file types supported by installed JetBrains IDEs:

- Programming languages (Java, Python, JS, etc.)
- Markup (HTML, XML, JSON, YAML)
- Configuration files
- Documentation (Markdown)

## Version Compatibility

| MCP Server | JetBrains IDE | Node.js |
| ---------- | ------------- | ------- |
| 1.0.0+     | 2023.1+       | 20.0+   |

## See Also

- [API Documentation](../usage/api-reference) for detailed specifications
- [Contributing Guide](./contributing) for development information
- [Technical Documentation](../technical/) for implementation details
