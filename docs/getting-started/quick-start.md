---
sidebar_position: 4
title: Quick Start
description: Get up and running with your first inspection in 2 minutes
---

# Quick Start

Get started with MCP JetBrains Code Inspections in just a few minutes.

## Basic Usage

Once you have [installed](./installation) the server, you can start using it immediately.

### Using with Claude Code

1. **Ensure the server is configured** in your MCP settings
2. **Restart Claude Code** to load the new server
3. **The `get_jetbrains_code_inspections` tool** will be available for code analysis

### Direct Usage Example

```javascript
// Analyze a TypeScript file
const result = await get_jetbrains_code_inspections({
    path: '/path/to/your/file.ts',
});

// Analyze a Python file
const result = await get_jetbrains_code_inspections({
    path: '/path/to/your/script.py',
});

// Analyze an entire directory
const result = await get_jetbrains_code_inspections({
    path: '/path/to/your/project',
});
```

## Understanding the Output

The server supports two output formats: **Markdown** (default) and **JSON**. You can configure the format using the `RESPONSE_FORMAT` environment
variable.

### Output Format Configuration

Configure the response format in your `.mcp.json`:

```json
{
    "mcpServers": {
        "jetbrains-inspections": {
            "command": "node",
            "args": ["/path/to/dist/index.js"],
            "env": {
                "RESPONSE_FORMAT": "markdown"
                // or "json"
            }
        }
    }
}
```

### Markdown Format (Default)

When `RESPONSE_FORMAT` is set to `"markdown"` (or not set), the output is formatted as human-readable Markdown:

```markdown
⚠️ **Issues found** - 67 problems detected (2 errors, 63 warnings, 2 infos).

## Code Inspection Results

**Total Issues**: 67

- 🔴 Errors: 2
- 🟡 Warnings: 63
- 🔵 Info: 2

---

### 🔴 Errors

#### 📄 `scripts/testing/example-errors-showcase.ts`

- **Line 12, Column 41**
    - Code: `Annotator`
    - Annotator: , or ) expected #loc

- **Line 298, Column 17** (length: 1)
    - Code: `Annotator`
    - Annotator: Unclosed character class #loc
    - Element: `'`

### 🟡 Warnings

#### 📄 `scripts/testing/example-errors-showcase.ts`

- **Line 11, Column 9** (length: 14)
    - Code: `JSUnusedGlobalSymbols`
    - JSUnusedGlobalSymbols: Unused function brokenFunction
    - Element: `brokenFunction`

- **Line 40, Column 4** (length: 38)
    - Code: `UnreachableCodeJS`
    - UnreachableCodeJS: Unreachable code #loc
    - Element: `console.log("This will never execute")`

### 🔵 Information

#### 📄 `scripts/testing/example-errors-showcase.ts`

- **Line 192, Column 1** (length: 5)
    - Code: `JSIgnoredPromiseFromCall`
    - JSIgnoredPromiseFromCall: Promise returned from fetch is ignored
    - Element: `fetch`
```

**Special cases:**

- **No issues found**: `✅ **No issues found** - Code inspection completed successfully with no problems detected.`
- **Errors**: `❌ **Inspection Error**\n\n{error message}`
- **Warnings**: `⚠️ **Warning**: {warning message}\n\n{totalProblems} problems found`

### JSON Format

When `RESPONSE_FORMAT` is set to `"json"`, the output is structured JSON:

```json
{
    "totalProblems": 67,
    "diagnostics": [
        {
            "file": "scripts/testing/example-errors-showcase.ts",
            "line": 12,
            "column": 41,
            "severity": "error",
            "code": "Annotator",
            "message": "Annotator: , or ) expected #loc"
        },
        {
            "file": "scripts/testing/example-errors-showcase.ts",
            "line": 298,
            "column": 17,
            "length": 1,
            "severity": "error",
            "code": "Annotator",
            "message": "Annotator: Unclosed character class #loc",
            "highlightedElement": "'"
        },
        {
            "file": "scripts/testing/example-errors-showcase.ts",
            "line": 279,
            "column": 1,
            "length": 55,
            "severity": "warning",
            "code": "ES6UnusedImports",
            "message": "ES6UnusedImports: <html>Unused <pre><code>...</code></pre></html>",
            "highlightedElement": "import { circularDep } from './test-inspection-errors';"
        }
    ]
}
```

**Note**: When errors occur or metadata is available, additional fields may be present:

```json
{
    "totalProblems": 0,
    "diagnostics": [],
    "error": "Error message if inspection failed",
    "warning": "Warning message if partially completed",
    "timeout": false,
    "metadata": {
        "targetPath": "/path/to/target",
        "projectRoot": "/path/to/project",
        "ideUsed": "WebStorm",
        "ideVersion": "2024.3",
        "executionTime": 14271,
        "timestamp": "2025-08-09T05:13:30.669Z"
    }
}
```

### Severity Levels

- **error** - Critical issues that must be fixed (compilation errors, syntax errors)
- **warning** - Issues that should be addressed (unused code, potential bugs, code quality)
- **info** - Information, suggestions and minor issues (typos, style suggestions)

### Diagnostic Fields

Core fields in each diagnostic object:

- **file** - Path to the file containing the issue (relative or absolute)
- **line** - Line number where the issue starts (1-indexed)
- **column** - Column number where the issue starts (1-indexed)
- **severity** - Issue severity level (`"error"`, `"warning"`, or `"info"`)
- **message** - Full message including inspection code and description

Optional fields that may appear:

- **length** - Length of the highlighted region in characters
- **code** - JetBrains inspection code (e.g., `"JSUnusedLocalSymbols"`)
- **highlightedElement** - The specific code element with the issue
- **category** - JetBrains inspection category (rarely present)
- **hints** - Array of strings with fix suggestions (rarely present)

Root-level fields in the response:

- **totalProblems** - Total count of detected issues
- **diagnostics** - Array of diagnostic objects
- **error** - Error message if the inspection failed (optional)
- **warning** - Warning message if inspection partially completed (optional)
- **timeout** - Boolean indicating if inspection timed out (optional)
- **metadata** - Additional execution metadata (optional, rarely included)

## Common Use Cases

### 1. Check a Single File

```javascript
await get_jetbrains_code_inspections({
    path: '/src/components/Button.tsx',
});
```

### 2. Analyze a Directory

```javascript
// This will analyze all files in the directory
await get_jetbrains_code_inspections({
    path: '/src',
});
```

### 3. Configure Output Format

Configure the response format using environment variables in your `.mcp.json`:

```json
{
    "mcpServers": {
        "jetbrains-inspections": {
            "command": "node",
            "args": ["/path/to/dist/index.js"],
            "env": {
                "RESPONSE_FORMAT": "json",
                "DEBUG": "true"
            }
        }
    }
}
```

## Testing Your Setup

### Using the Test Script

```bash
# Run interactive MCP test
yarn test:mcp
```

```bash
yarn test:mcp --path scripts/testing/example-errors-showcase.ts
```

This interactive script allows you to:

- Test the MCP server functionality
- Input file paths to inspect
- View formatted inspection results
- Test different configuration options

### Using MCP Inspector

```bash
npx @modelcontextprotocol/inspector dist/index.js
```

Then in the inspector:

1. Connect to the server
2. Call `get_jetbrains_code_inspections` with a file path
3. Review the returned diagnostics

## Troubleshooting Quick Start Issues

If you encounter issues:

1. **Check IDE is installed**: The server needs at least one JetBrains IDE
2. **Verify file paths**: Use absolute file or directory paths
3. **Check timeouts**: Large files may need increased timeout values
4. **Review logs**: Enable debug logging for detailed information

## Next Steps

- Learn about [Configuration](../configuration/) options
- Explore [Advanced Guides](../guides/)
- Read the [Technical Documentation](../technical/)
