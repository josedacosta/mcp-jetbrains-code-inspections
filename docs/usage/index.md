---
sidebar_position: 1
title: Usage
description: How to use the MCP JetBrains Code Inspections tool
---

# Usage Overview

MCP JetBrains Code Inspections provides a single MCP tool called `get_jetbrains_code_inspections` that analyzes code quality using JetBrains IDE
inspections.

## Tool Overview

### Tool Name

```
get_jetbrains_code_inspections
```

### Description

Run JetBrains IDE code inspections on files or directories with automatic IDE selection and profile detection.

### Parameters

| Parameter | Type   | Required | Description                                              |
| --------- | ------ | -------- | -------------------------------------------------------- |
| `path`    | string | Yes      | File or directory path to inspect (absolute or relative) |

## Quick Examples

### Analyze a Single File

```javascript
await get_jetbrains_code_inspections({
    path: 'src/components/Button.tsx',
});
```

### Analyze a Directory

```javascript
await get_jetbrains_code_inspections({
    path: 'src/utils/',
});
```

### Analyze Current Directory

```javascript
await get_jetbrains_code_inspections({
    path: '.',
});
```

## How It Works

1. **IDE Detection**: Automatically finds and selects the best available JetBrains IDE
2. **Profile Selection**: Uses appropriate inspection profile for the project
3. **Execution**: Runs the IDE's command-line inspector
4. **Processing**: Parses and formats the results
5. **Response**: Returns structured diagnostic information

## Response Format

### Markdown Format (Default)

```markdown
## Code Inspection Results

### File: src/app.ts

**WEAK WARNING** at line 15:

- **Issue**: Variable 'unused' is never used
- **Inspection**: UnusedDeclaration

**INFO** at line 23:

- **Issue**: TODO comment found
- **Inspection**: TodoComment
```

### JSON Format

```json
{
    "results": [
        {
            "file": "src/app.ts",
            "line": 15,
            "column": 5,
            "severity": "WEAK WARNING",
            "message": "Variable 'unused' is never used",
            "inspection": "UnusedDeclaration"
        }
    ],
    "summary": {
        "totalFiles": 1,
        "totalIssues": 1,
        "errors": 0,
        "warnings": 1
    }
}
```

## Supported File Types

The tool supports all file types that JetBrains IDEs can analyze:

### Web Development

- JavaScript (.js)
- TypeScript (.ts, .tsx)
- HTML (.html)
- CSS (.css, .scss, .less)
- Vue (.vue)
- React (.jsx, .tsx)

### Backend Languages

- Java (.java)
- Kotlin (.kt)
- Python (.py)
- PHP (.php)
- Go (.go)
- Ruby (.rb)
- C/C++ (.c, .cpp, .h)
- C# (.cs)

### Configuration Files

- JSON (.json)
- YAML (.yml, .yaml)
- XML (.xml)
- Properties files
- Dockerfile
- Package configuration files

## Automatic Features

### IDE Selection Priority

1. **IntelliJ IDEA** (Universal support)
2. **WebStorm** (Web development)
3. **PyCharm** (Python)
4. **PhpStorm** (PHP)
5. **GoLand** (Go)
6. **Other JetBrains IDEs**

### Project Detection

Automatically detects:

- Project root directory
- Appropriate inspection profiles
- Language-specific configurations
- Framework settings

### Profile Selection

Uses profiles in this order:

1. Custom profile specified via `FORCE_PROFILE_PATH`
2. Project-specific profiles in `.idea/inspectionProfiles/`
3. IDE default profiles
4. Built-in unified profile

## Configuration Through Environment Variables

Control behavior without changing code:

```json
{
    "env": {
        "INSPECTION_TIMEOUT": "300000",
        "EXCLUDE_INSPECTIONS": "SpellCheckingInspection,TodoComment",
        "RESPONSE_FORMAT": "json"
    }
}
```

See [Environment Variables](../configuration/environment-variables) for complete details.

## Usage Patterns

### Development Workflow

1. Make code changes
2. Run inspection on modified files
3. Review and fix issues
4. Commit clean code

### CI/CD Integration

1. Run inspections on entire codebase
2. Parse JSON output for automated processing
3. Fail builds on critical issues
4. Generate quality reports

### Code Review

1. Inspect pull request files
2. Identify potential issues before review
3. Maintain code quality standards
4. Provide automated feedback

## Next Steps

- **[Basic Usage](./basic-usage)** - Simple examples and common patterns
- **[Advanced Usage](./advanced-usage)** - Complex scenarios and optimization
- **[API Reference](./api-reference)** - Complete tool documentation
