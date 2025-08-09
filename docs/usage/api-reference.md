---
sidebar_position: 4
title: API Reference
description: Complete API documentation for the MCP tool
---

# API Reference

Complete documentation for the `get_jetbrains_code_inspections` MCP tool.

## Tool Overview

### Tool Name

```
get_jetbrains_code_inspections
```

### Description

Analyze code quality using JetBrains IDE inspections with automatic IDE selection and profile detection.

### Tool Type

MCP (Model Context Protocol) Tool

## Parameters

### Required Parameters

#### `path`

- **Type**: `string`
- **Required**: `true`
- **Description**: The file or directory path to analyze
- **Format**: Absolute or relative path
- **Examples**:
    - `"src/components/Button.tsx"` - Single file
    - `"src/utils/"` - Directory
    - `"."` - Current directory
    - `"/absolute/path/to/file.ts"` - Absolute path

## Configuration

### Environment Variables

Configure the tool behavior via environment variables in your MCP configuration:

#### Path Configuration

##### `FORCE_INSPECT_PATH`

- **Type**: `string`
- **Default**: Auto-detected
- **Description**: Force specific IDE inspect tool path (disables auto-detection)
- **Example**: `"/Applications/WebStorm.app/Contents/bin/inspect.sh"`

##### `FORCE_PROJECT_ROOT`

- **Type**: `string`
- **Default**: Auto-detected
- **Description**: Force project root directory (disables auto-detection)
- **Example**: `"/path/to/project"`

##### `FORCE_PROFILE_PATH`

- **Type**: `string`
- **Default**: Auto-detected
- **Description**: Force inspection profile path (disables default profile detection)
- **Example**: `"/path/to/custom-profile.xml"`

#### Execution Configuration

##### `INSPECTION_TIMEOUT`

- **Type**: `number` (milliseconds)
- **Default**: `120000` (2 minutes)
- **Description**: Timeout for inspection execution
- **Range**: `1000` to `600000` (1 second to 10 minutes)
- **Example**: `"300000"` (5 minutes)

#### Filter Configuration

##### `EXCLUDE_INSPECTIONS`

- **Type**: `string` (comma-separated)
- **Default**: None
- **Description**: Inspection codes to exclude from analysis
- **Example**: `"SpellCheckingInspection,TodoComment,UnusedDeclaration"`

##### `ONLY_INSPECTIONS`

- **Type**: `string` (comma-separated)
- **Default**: None
- **Description**: Only run these inspection codes (overrides exclude)
- **Example**: `"NullPointerException,ArrayIndexOutOfBounds"`

#### Output Configuration

##### `RESPONSE_FORMAT`

- **Type**: `string`
- **Default**: `"markdown"`
- **Values**: `"markdown"` | `"json"`
- **Description**: Output format for inspection results

##### `DEBUG`

- **Type**: `boolean`
- **Default**: `false`
- **Description**: Enable debug logging
- **Example**: `"true"`

## Response Formats

### Markdown Format (Default)

Human-readable formatted output:

```markdown
## Code Inspection Results for: src/components/Button.tsx

### Summary

- **Total Issues**: 3
- **Errors**: 1
- **Warnings**: 2
- **Files Analyzed**: 1

### Issues Found

**ERROR** at line 15, column 7:

- **Issue**: Variable 'config' is used before being declared
- **Inspection**: UseBeforeDeclaration

**WARNING** at line 23, column 12:

- **Issue**: Function 'handleClick' is never used
- **Inspection**: UnusedDeclaration

**WEAK WARNING** at line 8, column 1:

- **Issue**: TODO: Add proper error handling
- **Inspection**: TodoComment
```

### JSON Format

Structured data format for programmatic processing:

```json
{
    "totalProblems": 3,
    "diagnostics": [
        {
            "file": "src/components/Button.tsx",
            "line": 15,
            "column": 7,
            "severity": "error",
            "code": "UseBeforeDeclaration",
            "message": "UseBeforeDeclaration: Variable 'config' is used before being declared"
        },
        {
            "file": "src/components/Button.tsx",
            "line": 23,
            "column": 12,
            "length": 11,
            "severity": "warning",
            "code": "JSUnusedLocalSymbols",
            "message": "JSUnusedLocalSymbols: Unused function handleClick",
            "highlightedElement": "handleClick"
        },
        {
            "file": "src/components/Button.tsx",
            "line": 45,
            "column": 3,
            "severity": "info",
            "code": "SpellCheckingInspection",
            "message": "SpellCheckingInspection: Typo: In word 'recieve'",
            "highlightedElement": "recieve"
        }
    ]
}
```

## Response Schema

### JSON Response Interface

```typescript
interface InspectionResult {
    totalProblems: number;
    diagnostics: Diagnostic[];
    error?: string;
    warning?: string;
    timeout?: boolean;
    metadata?: InspectionMetadata;
}

interface Diagnostic {
    file: string;
    line: number;
    column: number;
    length?: number;
    severity: SeverityLevel;
    code?: string;
    message: string;
    highlightedElement?: string;
    category?: string;
    hints?: string[];
}

interface InspectionMetadata {
    targetPath: string;
    projectRoot: string;
    ideUsed: string;
    ideVersion?: string;
    executionTime: number;
    timestamp: Date;
}

type SeverityLevel = 'error' | 'warning' | 'info';
```

### Field Descriptions

#### InspectionResult Fields

- **`totalProblems`**: Total number of issues found
- **`diagnostics`**: Array of individual diagnostic issues
- **`error`**: Error message if inspection failed (optional)
- **`warning`**: Warning message for non-fatal issues (optional)
- **`timeout`**: Boolean indicating if inspection timed out (optional)
- **`metadata`**: Additional execution metadata (optional, rarely included)

#### Diagnostic Fields

**Required fields:**

- **`file`**: Path to the file containing the issue (relative or absolute)
- **`line`**: Line number (1-indexed)
- **`column`**: Column number (1-indexed)
- **`severity`**: Issue severity level (`"error"`, `"warning"`, or `"info"`)
- **`message`**: Full message including inspection code and description

**Optional fields:**

- **`length`**: Length of the highlighted region in characters
- **`code`**: JetBrains inspection code (e.g., `"JSUnusedLocalSymbols"`)
- **`highlightedElement`**: The specific code element with the issue
- **`category`**: JetBrains inspection category (rarely present)
- **`hints`**: Array of fix suggestions (rarely present)

#### Severity Levels

- **`error`**: Critical issues (syntax errors, compilation errors)
- **`warning`**: Issues that should be addressed (unused code, potential bugs)
- **`info`**: Informational messages, suggestions, and minor issues

## Usage Examples

### Basic Usage

```javascript
// Analyze a single file
const result = await get_jetbrains_code_inspections({
    path: 'src/utils/validation.ts',
});
```

### With Environment Configuration

```javascript
// Configure via MCP server setup
{
    "env"
:
    {
        "RESPONSE_FORMAT"
    :
        "json",
            "EXCLUDE_INSPECTIONS"
    :
        "SpellCheckingInspection,TodoComment",
            "INSPECTION_TIMEOUT"
    :
        "300000"
    }
}

// Then use the tool
const result = await get_jetbrains_code_inspections({
    path: "src/"
});

// Parse JSON response
const diagnostics = JSON.parse(result);
console.log(`Found ${diagnostics.totalProblems} issues`);
```

## Error Handling

### Common Error Types

#### Path Errors

```json
{
    "error": "Path does not exist: src/nonexistent.ts",
    "totalProblems": 0,
    "diagnostics": []
}
```

#### Timeout Errors

```json
{
    "timeout": true,
    "warning": "Inspection timed out after 120000ms",
    "totalProblems": 0,
    "diagnostics": []
}
```

#### IDE Errors

```json
{
    "error": "No suitable JetBrains IDE found. Please install a JetBrains IDE or set FORCE_INSPECT_PATH.",
    "totalProblems": 0,
    "diagnostics": []
}
```

### Error Response Structure

Errors are returned as valid responses with error information:

```typescript
interface ErrorResponse {
    error: string; // Error message
    totalProblems: 0; // Always 0 for errors
    diagnostics: []; // Always empty for errors
    timeout?: boolean; // True for timeout errors
}
```

## Supported File Types

The tool supports all file types that JetBrains IDEs can analyze:

### Programming Languages

- **JavaScript**: `.js`, `.jsx`, `.mjs`
- **TypeScript**: `.ts`, `.tsx`, `.d.ts`
- **Java**: `.java`
- **Kotlin**: `.kt`, `.kts`
- **Python**: `.py`, `.pyw`
- **PHP**: `.php`, `.phtml`
- **Go**: `.go`
- **Ruby**: `.rb`, `.rake`
- **C/C++**: `.c`, `.cpp`, `.h`, `.hpp`
- **C#**: `.cs`
- **Scala**: `.scala`
- **Groovy**: `.groovy`

### Web Technologies

- **HTML**: `.html`, `.htm`, `.xhtml`
- **CSS**: `.css`, `.scss`, `.sass`, `.less`
- **Vue**: `.vue`
- **Angular**: Templates and components

### Configuration Files

- **JSON**: `.json`, `.jsonc`
- **YAML**: `.yml`, `.yaml`
- **XML**: `.xml`, `.xsd`, `.wsdl`
- **Properties**: `.properties`
- **INI**: `.ini`
- **TOML**: `.toml`

### Build and Package Files

- **package.json**, **composer.json**, **pom.xml**
- **build.gradle**, **Cargo.toml**
- **tsconfig.json**, **webpack.config.js**
- **Dockerfile**, \*\*docker-compose.yml`

## IDE Detection Priority

The tool automatically detects and selects IDEs in this priority order:

1. **IntelliJ IDEA** - Universal support for all languages
2. **WebStorm** - Optimized for web development
3. **PyCharm** - Python development
4. **PhpStorm** - PHP development
5. **GoLand** - Go development
6. **RubyMine** - Ruby development
7. **CLion** - C/C++ development
8. **Rider** - .NET development
9. **Other JetBrains IDEs**

Override automatic detection with `FORCE_INSPECT_PATH` environment variable.

## Rate Limits and Performance

### Recommended Usage Patterns

- **Single files**: No restrictions
- **Small directories** (\<100 files): Standard timeout sufficient
- **Large directories** (\>100 files): Increase timeout to 300-600 seconds
- **Entire projects**: Consider selective analysis or batch processing

### Performance Considerations

- **File size**: Large files may require increased timeout
- **IDE performance**: Different IDEs have different performance characteristics
- **System resources**: Analysis is CPU and memory intensive
- **Network locations**: Avoid analyzing files on network drives

## Integration Examples

### CI/CD Integration

```javascript
async function qualityGate(files) {
    const results = [];

    for (const file of files) {
        const result = await get_jetbrains_code_inspections({ path: file });
        const diagnostics = JSON.parse(result);

        if (diagnostics.error) {
            throw new Error(`Analysis failed: ${diagnostics.error}`);
        }

        results.push(diagnostics);
    }

    const totalErrors = results.reduce((sum, r) => sum + r.diagnostics.filter((d) => d.severity === 'ERROR').length, 0);

    if (totalErrors > 0) {
        throw new Error(`Quality gate failed: ${totalErrors} errors found`);
    }

    return results;
}
```

### Batch Processing

```javascript
async function analyzeProject(rootPath, batchSize = 5) {
    // Get all source files (implementation specific)
    const files = await getSourceFiles(rootPath);

    const results = [];
    for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);

        const batchPromises = batch.map((file) => get_jetbrains_code_inspections({ path: file }));

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults.map((r) => JSON.parse(r)));

        // Optional delay to manage system resources
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return results;
}
```
