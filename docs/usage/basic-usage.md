---
sidebar_position: 2
title: Basic Usage
description: Common usage patterns and simple examples
---

# Basic Usage

This guide covers the most common ways to use the MCP JetBrains Code Inspections tool.

## Single File Analysis

### Analyze a Specific File

```javascript
await get_jetbrains_code_inspections({
    path: 'src/components/Header.tsx',
});
```

**Use Cases:**

- Check a file you're currently editing
- Validate changes before committing
- Quick quality check on specific files

### Example Response

```markdown
## Code Inspection Results for: src/components/Header.tsx

### Issues Found: 2

**WEAK WARNING** at line 12, column 7:

- **Issue**: Variable 'unusedVar' is never used
- **Inspection**: UnusedDeclaration

**INFO** at line 18, column 1:

- **Issue**: TODO: Add proper error handling
- **Inspection**: TodoComment
```

## Directory Analysis

### Analyze a Directory

```javascript
await get_jetbrains_code_inspections({
    path: 'src/utils',
});
```

**Use Cases:**

- Check all files in a module
- Analyze a specific package
- Review utility functions

### Analyze Nested Directories

```javascript
await get_jetbrains_code_inspections({
    path: 'src/components/forms',
});
```

The tool recursively analyzes all supported files in the directory.

## Project Analysis

### Analyze Entire Project

```javascript
await get_jetbrains_code_inspections({
    path: '.',
});
```

**Note**: For large projects, consider:

- Increasing the timeout: `INSPECTION_TIMEOUT=600000`
- Excluding directories: Use `.idea/inspectionProfiles/` configuration
- Running on specific directories first

### Analyze Source Directory

```javascript
await get_jetbrains_code_inspections({
    path: 'src/',
});
```

More focused than entire project, skips configuration and build files.

## Path Types

### Absolute Paths

```javascript
await get_jetbrains_code_inspections({
    path: '/Users/username/projects/myapp/src/index.ts',
});
```

### Relative Paths

```javascript
await get_jetbrains_code_inspections({
    path: './src/index.ts',
});
```

### Current Directory

```javascript
await get_jetbrains_code_inspections({
    path: '.',
});
```

## Common File Patterns

### Frontend Development

```javascript
// React component
await get_jetbrains_code_inspections({
    path: 'src/components/UserProfile.tsx',
});

// Styles
await get_jetbrains_code_inspections({
    path: 'src/styles/main.scss',
});

// Configuration
await get_jetbrains_code_inspections({
    path: 'webpack.config.js',
});
```

### Backend Development

```javascript
// Java class
await get_jetbrains_code_inspections({
    path: 'src/main/java/com/example/UserService.java',
});

// Python module
await get_jetbrains_code_inspections({
    path: 'src/services/user_service.py',
});

// Configuration
await get_jetbrains_code_inspections({
    path: 'application.yml',
});
```

## Understanding Results

### Severity Levels

Results include different severity levels:

- **ERROR**: Critical issues that prevent compilation
- **WARNING**: Important issues that should be fixed
- **WEAK WARNING**: Minor issues or style violations
- **INFO**: Informational messages (TODOs, suggestions)

### Common Inspection Types

#### Code Quality

- **UnusedDeclaration**: Unused variables, functions, imports
- **DuplicatedCode**: Repeated code blocks
- **ComplexityProblems**: High cyclomatic complexity

#### Type Safety

- **TypeScriptValidateTypes**: TypeScript type errors
- **NullPointerException**: Potential null pointer issues
- **ArrayIndexOutOfBounds**: Array access issues

#### Style and Formatting

- **ES6MissingAwait**: Missing await keywords
- **JSUnusedGlobalSymbols**: Unused global symbols
- **CssUnusedSymbol**: Unused CSS classes

## Basic Configuration

### Change Output Format

Set environment variable for JSON output:

```json
{
    "env": {
        "RESPONSE_FORMAT": "json"
    }
}
```

### Exclude Common Noise

Filter out noisy inspections:

```json
{
    "env": {
        "EXCLUDE_INSPECTIONS": "SpellCheckingInspection,TodoComment"
    }
}
```

### Increase Timeout

For larger files or slower systems:

```json
{
    "env": {
        "INSPECTION_TIMEOUT": "300000"
    }
}
```

## Best Practices

### 1. Start Small

Begin with single files before analyzing entire projects:

```javascript
// Good: Start with one file
await get_jetbrains_code_inspections({
    path: 'src/index.ts',
});

// Then expand to directories
await get_jetbrains_code_inspections({
    path: 'src/components',
});
```

### 2. Use Appropriate Paths

Choose the most specific path for your needs:

```javascript
// Specific file for focused analysis
await get_jetbrains_code_inspections({
    path: 'src/utils/validation.ts',
});

// Directory for module analysis
await get_jetbrains_code_inspections({
    path: 'src/utils',
});
```

### 3. Configure for Your Workflow

Set up environment variables that match your development needs:

```json
{
    "env": {
        "EXCLUDE_INSPECTIONS": "SpellCheckingInspection",
        "INSPECTION_TIMEOUT": "180000"
    }
}
```

### 4. Iterate Based on Results

Use inspection results to guide further analysis:

1. Run inspection on a directory
2. Identify files with many issues
3. Analyze those files individually
4. Fix issues and re-run inspection

## Common Workflows

### Pre-Commit Check

```javascript
// Check files you're about to commit
await get_jetbrains_code_inspections({
    path: 'src/components/NewFeature.tsx',
});
```

### Code Review Preparation

```javascript
// Analyze changed files
await get_jetbrains_code_inspections({
    path: 'src/services/updated-service.ts',
});
```

### Refactoring Validation

```javascript
// Check refactored code
await get_jetbrains_code_inspections({
    path: 'src/refactored-module',
});
```

### Quality Gate

```javascript
// Full project check before release
await get_jetbrains_code_inspections({
    path: 'src/',
});
```

## Error Handling

### Common Issues and Solutions

#### Timeout Errors

```
Inspection timed out after 120000ms
```

**Solution**: Increase timeout or analyze smaller paths

#### File Not Found

```
Path does not exist: src/nonexistent.ts
```

**Solution**: Verify the path exists and is accessible

#### IDE Not Found

```
No suitable JetBrains IDE found
```

**Solution**: Install a JetBrains IDE or set `FORCE_INSPECT_PATH`

## Next Steps

- **[Advanced Usage](./advanced-usage)** - Complex scenarios and optimization techniques
- **[API Reference](./api-reference)** - Complete parameter and response documentation
- **[Troubleshooting](../guides/troubleshooting)** - Solutions to common problems
