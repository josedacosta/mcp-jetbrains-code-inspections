---
sidebar_position: 3
title: Advanced Usage
description: Advanced techniques and optimization strategies
---

# Advanced Usage

This guide covers advanced usage patterns, optimization techniques, and complex scenarios for MCP JetBrains Code Inspections.

## Performance Optimization

### Large Project Analysis

When analyzing large codebases, use these strategies:

#### 1. Selective Directory Analysis

Instead of analyzing the entire project:

```javascript
// Analyze specific modules
await get_jetbrains_code_inspections({
    path: 'src/core',
});

await get_jetbrains_code_inspections({
    path: 'src/components',
});

await get_jetbrains_code_inspections({
    path: 'src/services',
});
```

#### 2. Increased Timeouts

Configure longer timeouts for large projects:

```json
{
    "env": {
        "INSPECTION_TIMEOUT": "600000" // 10 minutes
    }
}
```

#### 3. Exclude Unwanted Files

Use inspection profiles to exclude files:

```xml
<!-- In .idea/inspectionProfiles/Project_Default.xml -->
<component name="InspectionProjectProfileManager">
  <profile version="1.0">
    <option name="myName" value="Project Default" />
    <inspection_tool class="ES6UnusedImports" enabled="false" level="WARNING" enabled_by_default="false">
      <scope name="Tests" level="WARNING" enabled="false" />
    </inspection_tool>
  </profile>
</component>
```

## Advanced Filtering

### Include Only Specific Inspections

Focus on critical issues:

```json
{
    "env": {
        "ONLY_INSPECTIONS": "NullPointerException,ArrayIndexOutOfBounds,TypeScriptValidateTypes"
    }
}
```

### Exclude Noisy Inspections

Remove distracting issues:

```json
{
    "env": {
        "EXCLUDE_INSPECTIONS": "SpellCheckingInspection,TodoComment,UnusedDeclaration,JSUnusedGlobalSymbols"
    }
}
```

### Severity-Based Filtering

Target specific severity levels by excluding low-priority inspections:

```json
{
    "env": {
        "EXCLUDE_INSPECTIONS": "TodoComment,ConstantConditions,JSValidateTypes"
    }
}
```

## Multi-IDE Workflows

### Language-Specific IDE Selection

Force specific IDEs for different languages:

#### TypeScript Analysis with WebStorm

```json
{
    "env": {
        "FORCE_INSPECT_PATH": "/Applications/WebStorm.app/Contents/bin/inspect.sh"
    }
}
```

#### Java Analysis with IntelliJ IDEA

```json
{
    "env": {
        "FORCE_INSPECT_PATH": "/Applications/IntelliJ IDEA.app/Contents/bin/inspect.sh"
    }
}
```

#### Python Analysis with PyCharm

```json
{
    "env": {
        "FORCE_INSPECT_PATH": "/Applications/PyCharm.app/Contents/bin/inspect.sh"
    }
}
```

### Multiple Configuration Profiles

Set up different MCP server configurations for different use cases:

```json
{
    "mcpServers": {
        "jetbrains-strict": {
            "command": "node",
            "args": ["./dist/index.js"],
            "env": {
                "ONLY_INSPECTIONS": "NullPointerException,ArrayIndexOutOfBounds",
                "RESPONSE_FORMAT": "json"
            }
        },
        "jetbrains-comprehensive": {
            "command": "node",
            "args": ["./dist/index.js"],
            "env": {
                "EXCLUDE_INSPECTIONS": "SpellCheckingInspection",
                "INSPECTION_TIMEOUT": "600000"
            }
        }
    }
}
```

## Custom Inspection Profiles

### Creating Project-Specific Profiles

1. Open your project in a JetBrains IDE
2. Go to **Preferences/Settings** → **Editor** → **Inspections**
3. Customize inspection settings
4. Export profile or let it save to `.idea/inspectionProfiles/`

### Using Custom Profile Path

```json
{
    "env": {
        "FORCE_PROFILE_PATH": "/path/to/custom-profile.xml"
    }
}
```

### Profile Structure Example

```xml
<?xml version="1.0" encoding="UTF-8"?>
<component name="InspectionProjectProfileManager">
  <profile version="1.0">
    <option name="myName" value="Custom Profile" />

    <!-- Enable TypeScript validation -->
    <inspection_tool class="TypeScriptValidateTypes" enabled="true" level="ERROR" />

    <!-- Disable spell checking -->
    <inspection_tool class="SpellCheckingInspection" enabled="false" />

    <!-- Set unused declarations to warning -->
    <inspection_tool class="UnusedDeclaration" enabled="true" level="WARNING" />
  </profile>
</component>
```

## Batch Processing Patterns

### Sequential Analysis

Process multiple paths in sequence:

```javascript
const paths = ['src/components', 'src/services', 'src/utils', 'src/types'];

for (const path of paths) {
    const result = await get_jetbrains_code_inspections({ path });
    // Process each result
    console.log(`Analysis complete for ${path}`);
}
```

### File-by-File Analysis

For very large directories:

```javascript
// Get list of files first (pseudo-code)
const files = getFilesInDirectory('src/components');

for (const file of files) {
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        await get_jetbrains_code_inspections({ path: file });
    }
}
```

## JSON Output Processing

### Programmatic Result Handling

Enable JSON output for processing:

```json
{
    "env": {
        "RESPONSE_FORMAT": "json"
    }
}
```

### Example JSON Response Processing

```javascript
const result = await get_jetbrains_code_inspections({
    path: 'src/components',
});

// Parse the JSON response
const diagnostics = JSON.parse(result);

// Filter by severity
const errors = diagnostics.results.filter((d) => d.severity === 'ERROR');
const warnings = diagnostics.results.filter((d) => d.severity === 'WARNING');

// Group by file
const byFile = diagnostics.results.reduce((acc, diagnostic) => {
    if (!acc[diagnostic.file]) {
        acc[diagnostic.file] = [];
    }
    acc[diagnostic.file].push(diagnostic);
    return acc;
}, {});

// Generate reports
console.log(`Found ${errors.length} errors and ${warnings.length} warnings`);
```

## Integration Patterns

### CI/CD Pipeline Integration

#### Quality Gate Script

```javascript
async function qualityGate() {
    const result = await get_jetbrains_code_inspections({
        path: 'src/',
    });

    const diagnostics = JSON.parse(result);
    const errors = diagnostics.results.filter((d) => d.severity === 'ERROR');

    if (errors.length > 0) {
        console.error(`Quality gate failed: ${errors.length} errors found`);
        process.exit(1);
    }

    console.log('Quality gate passed');
}
```

#### Incremental Analysis

Analyze only changed files:

```javascript
// Get changed files from Git (pseudo-code)
const changedFiles = getChangedFiles();

for (const file of changedFiles) {
    if (isSupportedFile(file)) {
        await get_jetbrains_code_inspections({ path: file });
    }
}
```

### Code Review Integration

#### Pre-Review Analysis

```javascript
async function preReviewAnalysis(pullRequestFiles) {
    const issues = [];

    for (const file of pullRequestFiles) {
        const result = await get_jetbrains_code_inspections({ path: file });
        const diagnostics = JSON.parse(result);

        // Filter for review-relevant issues
        const criticalIssues = diagnostics.results.filter((d) => ['ERROR', 'WARNING'].includes(d.severity));

        issues.push(...criticalIssues);
    }

    return issues;
}
```

## Error Recovery and Resilience

### Timeout Handling

```javascript
async function robustAnalysis(path) {
    try {
        return await get_jetbrains_code_inspections({ path });
    } catch (error) {
        if (error.message.includes('timeout')) {
            console.warn(`Timeout analyzing ${path}, trying with smaller scope`);
            // Try analyzing individual files in the directory
            return await analyzeIndividualFiles(path);
        }
        throw error;
    }
}
```

### Fallback Strategies

```javascript
async function analyzeWithFallback(path) {
    const strategies = [
        () => get_jetbrains_code_inspections({ path }),
        () => get_jetbrains_code_inspections({ path: dirname(path) }),
        () => analyzeIndividualFiles(path),
    ];

    for (const strategy of strategies) {
        try {
            return await strategy();
        } catch (error) {
            console.warn(`Strategy failed: ${error.message}`);
        }
    }

    throw new Error(`All analysis strategies failed for ${path}`);
}
```

## Memory and Resource Management

### Resource Monitoring

```json
{
    "env": {
        "DEBUG": "true",
        "INSPECTION_TIMEOUT": "300000"
    }
}
```

Debug output includes resource usage information.

### Batch Size Optimization

Process files in batches to manage memory:

```javascript
async function analyzeInBatches(files, batchSize = 10) {
    const results = [];

    for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);

        const batchPromises = batch.map((file) => get_jetbrains_code_inspections({ path: file }));

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Optional: Add delay between batches
        await delay(1000);
    }

    return results;
}
```

## Advanced Configuration

### Environment-Specific Settings

#### Development Environment

```json
{
    "env": {
        "EXCLUDE_INSPECTIONS": "TodoComment,SpellCheckingInspection",
        "INSPECTION_TIMEOUT": "120000",
        "DEBUG": "true"
    }
}
```

#### Production Environment

```json
{
    "env": {
        "ONLY_INSPECTIONS": "NullPointerException,ArrayIndexOutOfBounds,TypeScriptValidateTypes",
        "INSPECTION_TIMEOUT": "600000",
        "RESPONSE_FORMAT": "json"
    }
}
```

#### CI/CD Environment

```json
{
    "env": {
        "EXCLUDE_INSPECTIONS": "SpellCheckingInspection,TodoComment,UnusedDeclaration",
        "INSPECTION_TIMEOUT": "300000",
        "RESPONSE_FORMAT": "json"
    }
}
```

## Performance Benchmarking

### Timing Analysis

```javascript
async function benchmarkAnalysis(path) {
    const startTime = Date.now();

    const result = await get_jetbrains_code_inspections({ path });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`Analysis of ${path} took ${duration}ms`);

    return { result, duration };
}
```

### Performance Tuning

Monitor and optimize based on:

1. **File count**: Reduce scope for large directories
2. **File size**: Increase timeout for large files
3. **Inspection count**: Use filtering to reduce work
4. **IDE performance**: Consider IDE-specific optimizations

## Next Steps

- **[API Reference](./api-reference)** - Complete tool documentation
- **[Troubleshooting](../guides/troubleshooting)** - Solve performance and configuration issues
- **[Best Practices](../guides/best-practices)** - Proven patterns for production use
