---
sidebar_position: 5
title: Shared Inspection Engine
description: Understanding JetBrains' unified inspection system across all IDEs
---

# Shared Inspection Engine

## Overview

All JetBrains IDEs share a common inspection engine built on the IntelliJ Platform. This unified architecture ensures consistent code analysis across
different IDEs and languages.

## Core Architecture

### IntelliJ Platform Foundation

The inspection engine is part of the IntelliJ Platform, which provides:

```
┌─────────────────────────────────────────┐
│         IntelliJ Platform Core          │
├─────────────────────────────────────────┤
│  PSI (Program Structure Interface)      │
│  - Language-agnostic AST representation │
│  - Unified code model                   │
├─────────────────────────────────────────┤
│      Inspection Infrastructure          │
│  - LocalInspectionTool base class       │
│  - GlobalInspectionTool base class      │
│  - InspectionProfileManager             │
├─────────────────────────────────────────┤
│     Language-Specific Plugins           │
│  - Java, TypeScript, Python, etc.       │
│  - Custom inspections per language      │
└─────────────────────────────────────────┘
```

### Inspection Types

#### Local Inspections

- Analyze single files independently
- Fast, run in real-time as you type
- Examples: unused variables, syntax errors

#### Global Inspections

- Analyze entire project context
- Slower, typically run on-demand
- Examples: duplicate code, cyclic dependencies

## Execution Pipeline

Based on our implementation in `InspectionExecutor.ts`:

### 1. Project Loading

```typescript
// From ProjectAnalyzer.ts
async analyzeProject(projectPath: string): Promise<ProjectInfo> {
    const ideaDir = path.join(projectPath, '.idea');
    // Load project configuration
    // Detect project type and structure
}
```

### 2. Profile Resolution

```typescript
// From InspectionProfileManager.ts
async resolveProfile(options: ProfileOptions): Promise<string> {
    // Check for forced profile path
    if (options.forcedPath) return options.forcedPath;

    // Look for project-specific profiles
    const projectProfile = await this.findProjectProfile();
    if (projectProfile) return projectProfile;

    // Fall back to unified profile
    return this.getUnifiedProfile();
}
```

### 3. Inspection Execution

```typescript
// From InspectionStrategy.ts
buildCommand(params: InspectionParams): string[] {
    return [
        inspectPath,
        projectRoot,
        profilePath,
        outputPath,
        '-format', 'json',
        '-d', targetPath
    ];
}
```

### 4. Result Processing

```typescript
// From InspectionResultProcessor.ts
async process(rawOutput: string): Promise<InspectionResult> {
    const parsed = await this.parser.parse(rawOutput);
    const normalized = this.normalizer.normalize(parsed);
    const filtered = this.filter.apply(normalized);
    return this.formatter.format(filtered);
}
```

## Language Support

### How Multi-Language Support Works

Each JetBrains IDE includes:

1. **Core Platform**: Shared inspection engine
2. **Language Plugins**: Language-specific analyzers
3. **Unified Interface**: Common `inspect.sh` command

### Language Detection

From our `IDEDetector.ts`:

```typescript
// IDE capabilities are determined by installed plugins
const ideCapabilities = {
    'IntelliJ IDEA': ['java', 'kotlin', 'scala', 'groovy'],
    WebStorm: ['javascript', 'typescript', 'html', 'css'],
    PyCharm: ['python', 'django', 'flask'],
    PhpStorm: ['php', 'html', 'javascript'],
    GoLand: ['go'],
    RubyMine: ['ruby', 'rails'],
    CLion: ['c', 'cpp', 'cmake'],
    Rider: ['csharp', 'fsharp', 'vb'],
};
```

## Inspection Registration

### How Inspections Are Registered

Each inspection is registered via plugin.xml:

```xml
<idea-plugin>
  <extensions defaultExtensionNs="com.intellij">
    <localInspection
      language="TypeScript"
      displayName="Unused local symbols"
      groupName="TypeScript"
      enabledByDefault="true"
      level="WARNING"
      implementationClass="com.intellij.lang.javascript.inspections.JSUnusedLocalSymbolsInspection"/>
  </extensions>
</idea-plugin>
```

### Inspection Metadata

Each inspection contains:

- **ID**: Unique identifier (e.g., `JSUnusedLocalSymbols`)
- **Display Name**: Human-readable name
- **Group**: Category for organization
- **Default Severity**: ERROR, WARNING, WEAK WARNING, INFO
- **Language**: Target language(s)

## Result Format

### Unified JSON Output

All IDEs produce the same JSON format:

```json
{
    "problems": [
        {
            "file": "src/example.ts",
            "line": 10,
            "column": 5,
            "severity": "WARNING",
            "description": "Variable 'unused' is never used",
            "inspectionId": "JSUnusedLocalSymbols",
            "category": "Declaration redundancy"
        }
    ]
}
```

### Severity Mapping

From `SeverityMapper.ts`:

```typescript
export class SeverityMapper {
    private readonly severityMap = {
        ERROR: DiagnosticSeverity.Error,
        WARNING: DiagnosticSeverity.Warning,
        'WEAK WARNING': DiagnosticSeverity.Information,
        INFO: DiagnosticSeverity.Hint,
        INFORMATION: DiagnosticSeverity.Hint,
        'SERVER PROBLEM': DiagnosticSeverity.Error,
        TYPO: DiagnosticSeverity.Information,
    };
}
```

## Performance Optimizations

### Caching Mechanisms

1. **Index Caching**: PSI trees are cached for performance
2. **Inspection Results**: Can be cached between runs
3. **Profile Caching**: Profiles loaded once per session

### Parallel Processing

The inspection engine can:

- Run multiple inspections in parallel
- Process multiple files simultaneously
- Use worker threads for CPU-intensive analysis

## Command-Line Interface

### The `inspect.sh` Script

All IDEs provide the same CLI interface:

```bash
#!/bin/sh
# Simplified representation of inspect.sh

IDE_HOME="$(dirname "$0")/.."
IDEA_PROPERTIES="${IDE_HOME}/bin/idea.properties"

# Set isolated configuration to avoid conflicts
IDEA_CONFIG_PATH="${TMPDIR}/idea-config-$$"
IDEA_SYSTEM_PATH="${TMPDIR}/idea-system-$$"

exec java \
  -Didea.config.path="${IDEA_CONFIG_PATH}" \
  -Didea.system.path="${IDEA_SYSTEM_PATH}" \
  -classpath "${IDE_HOME}/lib/*" \
  com.intellij.codeInspection.InspectionMain \
  "$@"
```

### Why Results Are Consistent

1. **Same Core Engine**: All IDEs use IntelliJ Platform
2. **Shared Inspections**: Common inspections across IDEs
3. **Unified Profiles**: Profile format is standardized
4. **Common Output**: JSON format is identical

## Integration Points

### How Our MCP Server Integrates

1. **IDE Detection**: Find available IDEs
2. **Project Analysis**: Read `.idea` configuration
3. **Profile Management**: Handle inspection profiles
4. **Execution**: Run `inspect.sh` subprocess
5. **Result Processing**: Parse and normalize output

### Key Integration Classes

- `IDEDetector`: Finds installed IDEs
- `IDESelector`: Chooses best IDE for the task
- `InspectionExecutor`: Manages inspection process
- `ResultParser`: Processes inspection output
- `DiagnosticNormalizer`: Standardizes results

## Best Practices

### For Consistent Results

1. **Use Unified Profiles**: Ensure profiles work across IDEs
2. **Specify Timeouts**: Set appropriate timeouts for large projects
3. **Filter Appropriately**: Use include/exclude filters
4. **Handle Errors Gracefully**: Implement proper error handling

### For Performance

1. **Scope Inspections**: Inspect only necessary files
2. **Use Local Inspections**: When project context isn't needed
3. **Cache Results**: When analyzing same code repeatedly
4. **Parallelize**: Run independent inspections concurrently

## Troubleshooting

### Common Issues

1. **Different Results Between IDEs**
    - Check language plugin versions
    - Verify profile compatibility
    - Ensure same project configuration

2. **Performance Problems**
    - Increase timeout values
    - Reduce inspection scope
    - Use faster local inspections

3. **Missing Inspections**
    - Verify IDE has required plugins
    - Check inspection is enabled in profile
    - Ensure language support is installed

## References

- [IntelliJ Platform SDK](https://plugins.jetbrains.com/docs/intellij/code-inspections.html)
- [Creating Custom Inspections](https://www.jetbrains.com/help/idea/creating-custom-inspections.html)
- [Inspection Profiles](https://www.jetbrains.com/help/idea/inspection-profiles.html)
