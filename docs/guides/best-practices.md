---
sidebar_position: 5
title: Best Practices
description: Proven patterns and recommendations for production use
---

# Best Practices

This guide provides proven patterns, recommendations, and best practices for using MCP JetBrains Code Inspections effectively in different scenarios.

## Development Workflow

### 1. Start Small, Scale Up

Begin with focused analysis before expanding scope:

```javascript
// ✅ Good: Start with single file
await get_jetbrains_code_inspections({
    path: 'src/components/Button.tsx',
});

// ✅ Then expand to directory
await get_jetbrains_code_inspections({
    path: 'src/components',
});

// ❌ Avoid: Starting with entire project
await get_jetbrains_code_inspections({
    path: '.',
});
```

### 2. Use Appropriate Configuration

Configure environment variables based on your use case:

#### Development Environment

```json
{
    "env": {
        "EXCLUDE_INSPECTIONS": "SpellCheckingInspection,TodoComment",
        "INSPECTION_TIMEOUT": "120000",
        "DEBUG": "true"
    }
}
```

#### Production/CI Environment

```json
{
    "env": {
        "ONLY_INSPECTIONS": "NullPointerException,TypeScriptValidateTypes,ArrayIndexOutOfBounds",
        "INSPECTION_TIMEOUT": "300000",
        "RESPONSE_FORMAT": "json"
    }
}
```

### 3. Pre-Commit Integration

Use inspections as part of your pre-commit workflow:

```javascript
// Check only modified files
const modifiedFiles = getModifiedFiles(); // Your implementation

for (const file of modifiedFiles) {
    if (isSupportedFile(file)) {
        const result = await get_jetbrains_code_inspections({ path: file });

        // Parse and check for critical issues
        const diagnostics = JSON.parse(result);
        const errors = diagnostics.diagnostics.filter((d) => d.severity === 'ERROR');

        if (errors.length > 0) {
            console.error(`Commit blocked: ${errors.length} errors in ${file}`);
            process.exit(1);
        }
    }
}
```

## Performance Optimization

### 1. Timeout Configuration

Set appropriate timeouts based on project size:

| Project Size              | Recommended Timeout |
| ------------------------- | ------------------- |
| Small (\<50 files)        | 60,000ms (1 min)    |
| Medium (50-200 files)     | 180,000ms (3 min)   |
| Large (200-1000 files)    | 300,000ms (5 min)   |
| Very Large (\>1000 files) | 600,000ms (10 min)  |

### 2. Selective Analysis

Target specific areas instead of analyzing everything:

```javascript
// ✅ Analyze by feature
await get_jetbrains_code_inspections({ path: 'src/auth' });
await get_jetbrains_code_inspections({ path: 'src/api' });

// ✅ Analyze by file type focus
await get_jetbrains_code_inspections({ path: 'src/components' });
await get_jetbrains_code_inspections({ path: 'src/services' });
```

### 3. Batch Processing

Process multiple paths efficiently:

```javascript
async function analyzeInBatches(paths, concurrency = 3) {
    const results = [];

    for (let i = 0; i < paths.length; i += concurrency) {
        const batch = paths.slice(i, i + concurrency);

        const batchPromises = batch.map((path) => get_jetbrains_code_inspections({ path }));

        const batchResults = await Promise.allSettled(batchPromises);
        results.push(...batchResults);

        // Small delay to prevent overwhelming the system
        await delay(500);
    }

    return results;
}
```

## Configuration Management

### 1. Environment-Specific Configurations

Create different configurations for different environments:

**Development (.mcp.dev.json)**

```json
{
    "mcpServers": {
        "jetbrains-inspections": {
            "command": "yarn",
            "args": ["dev"],
            "env": {
                "DEBUG": "true",
                "EXCLUDE_INSPECTIONS": "SpellCheckingInspection,TodoComment",
                "INSPECTION_TIMEOUT": "120000"
            }
        }
    }
}
```

**Production (.mcp.prod.json)**

```json
{
    "mcpServers": {
        "jetbrains-inspections": {
            "command": "node",
            "args": ["./dist/index.js"],
            "env": {
                "RESPONSE_FORMAT": "json",
                "INSPECTION_TIMEOUT": "600000",
                "EXCLUDE_INSPECTIONS": "SpellCheckingInspection,TodoComment,UnusedDeclaration"
            }
        }
    }
}
```

### 2. Team Configuration

Standardize configuration across your team:

```json
{
    "mcpServers": {
        "jetbrains-inspections": {
            "command": "node",
            "args": ["./dist/index.js"],
            "env": {
                "EXCLUDE_INSPECTIONS": "SpellCheckingInspection,TodoComment",
                "INSPECTION_TIMEOUT": "300000",
                "RESPONSE_FORMAT": "markdown"
            }
        }
    }
}
```

### 3. Project-Specific Profiles

Create inspection profiles for different project types:

**Frontend Projects**

```json
{
    "env": {
        "ONLY_INSPECTIONS": "TypeScriptValidateTypes,ES6MissingAwait,UnusedDeclaration",
        "EXCLUDE_INSPECTIONS": "SpellCheckingInspection"
    }
}
```

**Backend Projects**

```json
{
    "env": {
        "ONLY_INSPECTIONS": "NullPointerException,ArrayIndexOutOfBounds,UnusedDeclaration",
        "EXCLUDE_INSPECTIONS": "SpellCheckingInspection,TodoComment"
    }
}
```

## Quality Gates and CI/CD

### 1. Quality Gate Implementation

Implement quality gates that fail builds on critical issues:

```javascript
async function qualityGate(paths, maxErrors = 0, maxWarnings = 10) {
    let totalErrors = 0;
    let totalWarnings = 0;

    for (const path of paths) {
        const result = await get_jetbrains_code_inspections({ path });
        const diagnostics = JSON.parse(result);

        if (diagnostics.error) {
            throw new Error(`Analysis failed for ${path}: ${diagnostics.error}`);
        }

        const errors = diagnostics.diagnostics.filter((d) => d.severity === 'ERROR');
        const warnings = diagnostics.diagnostics.filter((d) => d.severity === 'WARNING');

        totalErrors += errors.length;
        totalWarnings += warnings.length;
    }

    if (totalErrors > maxErrors) {
        throw new Error(`Quality gate failed: ${totalErrors} errors (max: ${maxErrors})`);
    }

    if (totalWarnings > maxWarnings) {
        console.warn(`Warning threshold exceeded: ${totalWarnings} warnings (max: ${maxWarnings})`);
    }

    console.log(`Quality gate passed: ${totalErrors} errors, ${totalWarnings} warnings`);
}
```

### 2. Progressive Quality Improvement

Gradually improve code quality over time:

```javascript
// Start with relaxed rules
const initialConfig = {
    EXCLUDE_INSPECTIONS: 'SpellCheckingInspection,TodoComment,UnusedDeclaration,JSUnusedGlobalSymbols',
};

// Progressively remove exclusions
const improvedConfig = {
    EXCLUDE_INSPECTIONS: 'SpellCheckingInspection,TodoComment',
};

// Final strict configuration
const strictConfig = {
    EXCLUDE_INSPECTIONS: 'SpellCheckingInspection',
};
```

### 3. Reporting and Metrics

Generate comprehensive reports:

```javascript
async function generateQualityReport(paths) {
    const report = {
        timestamp: new Date().toISOString(),
        totalFiles: 0,
        totalIssues: 0,
        issuesBySeverity: {},
        issuesByFile: {},
        topInspections: {},
    };

    for (const path of paths) {
        const result = await get_jetbrains_code_inspections({ path });
        const diagnostics = JSON.parse(result);

        report.totalFiles++;
        report.totalIssues += diagnostics.totalProblems;

        // Aggregate statistics
        for (const diagnostic of diagnostics.diagnostics) {
            // By severity
            report.issuesBySeverity[diagnostic.severity] = (report.issuesBySeverity[diagnostic.severity] || 0) + 1;

            // By file
            report.issuesByFile[diagnostic.file] = (report.issuesByFile[diagnostic.file] || 0) + 1;

            // By inspection type
            report.topInspections[diagnostic.inspection] = (report.topInspections[diagnostic.inspection] || 0) + 1;
        }
    }

    return report;
}
```

## Error Handling and Resilience

### 1. Robust Error Handling

Handle errors gracefully:

```javascript
async function robustAnalysis(path, retries = 2) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await get_jetbrains_code_inspections({ path });
        } catch (error) {
            if (attempt === retries) {
                console.error(`Analysis failed after ${retries + 1} attempts: ${error.message}`);
                throw error;
            }

            if (error.message.includes('timeout')) {
                console.warn(`Attempt ${attempt + 1} timed out, retrying with longer timeout...`);
                // Increase timeout for retry
                process.env.INSPECTION_TIMEOUT = String(parseInt(process.env.INSPECTION_TIMEOUT || '120000') * 1.5);
            } else {
                console.warn(`Attempt ${attempt + 1} failed: ${error.message}, retrying...`);
            }

            await delay(1000 * (attempt + 1)); // Exponential backoff
        }
    }
}
```

### 2. Fallback Strategies

Implement fallback strategies for large projects:

```javascript
async function analyzeWithFallback(path) {
    try {
        // First try: analyze the full path
        return await get_jetbrains_code_inspections({ path });
    } catch (error) {
        if (error.message.includes('timeout')) {
            console.warn(`Timeout analyzing ${path}, trying directory-by-directory approach`);

            // Fallback: analyze subdirectories individually
            const subdirs = getSubdirectories(path);
            const results = [];

            for (const subdir of subdirs) {
                try {
                    const result = await get_jetbrains_code_inspections({ path: subdir });
                    results.push(result);
                } catch (subdirError) {
                    console.warn(`Failed to analyze ${subdir}: ${subdirError.message}`);
                }
            }

            return combineResults(results);
        }

        throw error;
    }
}
```

## Monitoring and Observability

### 1. Enable Debug Logging

Use debug logging in development:

```json
{
    "env": {
        "DEBUG": "true"
    }
}
```

### 2. Performance Monitoring

Track analysis performance:

```javascript
async function monitoredAnalysis(path) {
    const startTime = Date.now();
    let result;

    try {
        result = await get_jetbrains_code_inspections({ path });
        const duration = Date.now() - startTime;

        console.log(`✅ Analysis completed: ${path} (${duration}ms)`);

        // Log slow analyses
        if (duration > 60000) {
            console.warn(`⚠️ Slow analysis detected: ${path} took ${duration}ms`);
        }

        return result;
    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`❌ Analysis failed: ${path} after ${duration}ms - ${error.message}`);
        throw error;
    }
}
```

## IDE Management

### 1. Leverage Isolated Configuration

The server uses isolated configuration directories, so inspections work seamlessly even when IDEs are already running:

```json
{
    "env": {
        // Optional: Force specific IDE if needed
        "FORCE_INSPECT_PATH": "/Applications/IntelliJ IDEA.app/Contents/bin/inspect.sh"
    }
}
```

**Note**: Thanks to `-Didea.config.path` and `-Didea.system.path` isolation, there are no conflicts with running IDE instances.

### 2. IDE-Specific Optimizations

Use the best IDE for each language:

```javascript
const ideMapping = {
    '.ts': '/Applications/WebStorm.app/Contents/bin/inspect.sh',
    '.tsx': '/Applications/WebStorm.app/Contents/bin/inspect.sh',
    '.js': '/Applications/WebStorm.app/Contents/bin/inspect.sh',
    '.java': '/Applications/IntelliJ IDEA.app/Contents/bin/inspect.sh',
    '.py': '/Applications/PyCharm.app/Contents/bin/inspect.sh',
    '.php': '/Applications/PhpStorm.app/Contents/bin/inspect.sh',
};

function getOptimalIDE(filePath) {
    const extension = path.extname(filePath);
    return ideMapping[extension] || ideMapping['.ts']; // Default to WebStorm
}
```

## Documentation and Team Guidelines

### 1. Document Your Configuration

Create team documentation:

```markdown
# Project Code Inspection Guidelines

## Configuration

- Timeout: 300 seconds for full project analysis
- Excluded inspections: SpellCheckingInspection, TodoComment
- Format: JSON for CI/CD, Markdown for development

## Usage Patterns

- Pre-commit: Analyze only changed files
- CI/CD: Full project analysis with error threshold
- Development: Directory-level analysis

## Troubleshooting

- Increase timeout if analysis fails
- Use DEBUG=true for detailed logging
- Check IDE installation if no IDEs found
```

### 2. Code Review Integration

Include inspection results in code reviews:

```javascript
async function generateReviewComment(files) {
    const issues = [];

    for (const file of files) {
        const result = await get_jetbrains_code_inspections({ path: file });
        const diagnostics = JSON.parse(result);

        const criticalIssues = diagnostics.diagnostics.filter((d) => ['ERROR', 'WARNING'].includes(d.severity));

        if (criticalIssues.length > 0) {
            issues.push({
                file,
                issues: criticalIssues,
            });
        }
    }

    if (issues.length === 0) {
        return '✅ No critical code quality issues found';
    }

    let comment = '⚠️ Code quality issues found:\n\n';

    for (const { file, issues: fileIssues } of issues) {
        comment += `**${file}**:\n`;
        for (const issue of fileIssues) {
            comment += `- Line ${issue.line}: ${issue.message} (${issue.inspection})\n`;
        }
        comment += '\n';
    }

    return comment;
}
```

This comprehensive set of best practices will help you use MCP JetBrains Code Inspections effectively across different scenarios and team
environments.
