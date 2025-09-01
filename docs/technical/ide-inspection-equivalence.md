---
sidebar_position: 6
title: IDE Inspection Equivalence
description: Cross-IDE compatibility and inspection parity between JetBrains IDEs
---

# IDE Inspection Equivalence

## Overview

This document explains how different JetBrains IDEs provide equivalent inspection capabilities and how our MCP server ensures consistent results
regardless of which IDE is used.

## IDE Selection Strategy

Based on our `IDESelector.ts` implementation:

```typescript
export class IDESelector {
    private readonly priorityOrder = [
        'IntelliJ IDEA', // Most comprehensive
        'WebStorm', // JavaScript/TypeScript focus
        'PyCharm', // Python focus
        'PhpStorm', // PHP focus
        'GoLand', // Go focus
        'RubyMine', // Ruby focus
        'CLion', // C/C++ focus
        'Rider', // .NET focus
        'DataGrip', // Database focus
    ];
}
```

## Language Coverage Matrix

### IDE Capabilities

| IDE               | Primary Languages                 | Additional Languages                                    | Shared Inspections             |
| ----------------- | --------------------------------- | ------------------------------------------------------- | ------------------------------ |
| **IntelliJ IDEA** | Java, Kotlin, Scala, Groovy       | HTML, CSS, JavaScript, TypeScript, SQL, XML, JSON, YAML | ✅ All platform inspections    |
| **WebStorm**      | JavaScript, TypeScript, HTML, CSS | JSON, XML, YAML, Markdown                               | ✅ Web development inspections |
| **PyCharm**       | Python                            | HTML, CSS, JavaScript, SQL, JSON                        | ✅ Python + web inspections    |
| **PhpStorm**      | PHP                               | HTML, CSS, JavaScript, SQL, JSON                        | ✅ PHP + web inspections       |
| **GoLand**        | Go                                | HTML, CSS, JavaScript, JSON                             | ✅ Go + basic web inspections  |
| **RubyMine**      | Ruby, Rails                       | HTML, CSS, JavaScript, SQL                              | ✅ Ruby + web inspections      |
| **CLion**         | C, C++, Rust                      | CMake, Python, Assembly                                 | ✅ Native code inspections     |
| **Rider**         | C#, F#, VB.NET                    | JavaScript, TypeScript, SQL                             | ✅ .NET + web inspections      |

## Shared Inspection Categories

### Platform-Level Inspections

All JetBrains IDEs share these inspection categories:

```typescript
// From our unified inspection profile
const sharedInspections = {
    // General code quality
    DuplicatedCode: 'All IDEs',
    RedundantSuppression: 'All IDEs',
    UnusedDeclaration: 'All IDEs',
    TodoComment: 'All IDEs',

    // File and project structure
    InconsistentLineSeparators: 'All IDEs',
    LongLine: 'All IDEs',
    ProblematicWhitespace: 'All IDEs',
    TrailingWhitespace: 'All IDEs',

    // Version control
    CommitMessageFormat: 'All IDEs',
    UnresolvedMergeConflict: 'All IDEs',

    // Documentation
    MissingJavadoc: 'Java-capable IDEs',
    InvalidJavadoc: 'Java-capable IDEs',

    // Security
    HardcodedPassword: 'All IDEs',
    SensitiveDataExposure: 'All IDEs',
};
```

## Inspection Profile Compatibility

### Unified Profile Structure

Our `unified.xml` profile ensures cross-IDE compatibility:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<profile version="1.0">
  <option name="myName" value="Unified" />

  <!-- Universal inspections work in all IDEs -->
  <inspection_tool class="DuplicatedCode" enabled="true" level="WARNING" enabled_by_default="true">
    <option name="MIN_DUPLICATED_LINES" value="10" />
  </inspection_tool>

  <!-- Language-specific inspections are gracefully ignored if not supported -->
  <inspection_tool class="TypeScriptValidateTypes" enabled="true" level="ERROR" enabled_by_default="true">
    <!-- Only active in IDEs with TypeScript support -->
  </inspection_tool>

  <inspection_tool class="PyPep8Inspection" enabled="true" level="WARNING" enabled_by_default="true">
    <!-- Only active in PyCharm -->
  </inspection_tool>
</profile>
```

### Profile Resolution Logic

From `InspectionProfileManager.ts`:

```typescript
async resolveProfile(options: ProfileOptions): Promise<string> {
    // 1. Check for forced profile
    if (options.forcedPath) {
        return options.forcedPath;
    }

    // 2. Look for project-specific profile
    const projectProfile = await this.findProjectProfile(options.projectPath);
    if (projectProfile) {
        return projectProfile;
    }

    // 3. Use unified profile (works across all IDEs)
    return this.getUnifiedProfilePath();
}
```

## Ensuring Equivalence

### 1. Automatic IDE Selection

The `IDEDetector` finds all available IDEs:

```typescript
async detectIDEs(): Promise<IDE[]> {
    const detectedIDEs: IDE[] = [];

    for (const location of this.getSearchLocations()) {
        const ides = await this.scanLocation(location);
        detectedIDEs.push(...ides);
    }

    // Sort by priority for consistent selection
    return this.sortByPriority(detectedIDEs);
}
```

### 2. Fallback Mechanism

If the preferred IDE isn't available:

```typescript
selectBestIDE(availableIDEs: IDE[], projectType?: string): IDE {
    // Try to match project type
    if (projectType) {
        const matched = this.matchByProjectType(availableIDEs, projectType);
        if (matched) return matched;
    }

    // Fall back to priority order
    return availableIDEs[0]; // Already sorted by priority
}
```

### 3. Result Normalization

The `DiagnosticNormalizer` ensures consistent output:

```typescript
normalize(diagnostic: RawDiagnostic): NormalizedDiagnostic {
    return {
        file: this.normalizeFilePath(diagnostic.file),
        line: diagnostic.line,
        column: diagnostic.column || 1,
        severity: this.normalizeSeverity(diagnostic.severity),
        message: this.normalizeMessage(diagnostic.message),
        inspection: diagnostic.inspectionId || 'Unknown',
        category: diagnostic.category || 'General',
    };
}
```

## Language-Specific Considerations

### JavaScript/TypeScript

Works identically in:

- WebStorm (primary)
- IntelliJ IDEA (with plugin)
- PyCharm Professional
- PhpStorm

### Python

Works identically in:

- PyCharm (primary)
- IntelliJ IDEA (with plugin)
- CLion (limited support)

### Java

Works identically in:

- IntelliJ IDEA (primary)
- Android Studio
- Other IDEs (limited support)

## Handling IDE Differences

### Graceful Degradation

When an inspection isn't available:

```typescript
class DiagnosticFilter {
    filter(diagnostics: Diagnostic[], options: FilterOptions): Diagnostic[] {
        return diagnostics.filter((d) => {
            // Skip unsupported inspections gracefully
            if (this.isUnsupported(d.inspection)) {
                this.logger.debug(`Skipping unsupported: ${d.inspection}`);
                return false;
            }
            return true;
        });
    }
}
```

### Version Compatibility

Handling different IDE versions:

```typescript
class IDEVersionChecker {
    isCompatible(ide: IDE): boolean {
        const minVersion = this.getMinimumVersion(ide.name);
        return this.compareVersions(ide.version, minVersion) >= 0;
    }
}
```

## Testing Equivalence

### Cross-IDE Validation

To verify equivalence, run the same inspection across different IDEs:

```bash
# Test with WebStorm
FORCE_INSPECT_PATH="/Applications/WebStorm.app/Contents/bin/inspect.sh" \
  node dist/index.js

# Test with IntelliJ IDEA
FORCE_INSPECT_PATH="/Applications/IntelliJ IDEA.app/Contents/bin/inspect.sh" \
  node dist/index.js

# Compare results
diff webstorm-results.json intellij-results.json
```

### Expected Differences

Minor differences are expected:

1. **Language-specific inspections**: Only in IDEs with language support
2. **Plugin inspections**: Depend on installed plugins
3. **Performance**: Some IDEs are optimized for specific languages

### Unexpected Differences

If significant differences occur:

1. Check IDE versions are similar
2. Verify same plugins are installed
3. Ensure profiles are compatible
4. Check project configuration

## Best Practices for Equivalence

### 1. Use Universal Inspections

Focus on inspections available across all IDEs:

- Code style violations
- Duplicate code detection
- TODO comments
- Basic syntax errors

### 2. Configure Environment Properly

Set environment variables for consistency:

```bash
# Force specific IDE for reproducibility
export FORCE_INSPECT_PATH="/path/to/preferred/ide/inspect.sh"

# Use same profile across runs
export FORCE_PROFILE_PATH="/path/to/standard-profile.xml"

# Consistent timeout
export INSPECTION_TIMEOUT=300000
```

### 3. Handle Language-Specific Cases

```typescript
// Example: Conditional inspection based on file type
if (fileExtension === '.py' && !hasPythonSupport(selectedIDE)) {
    logger.warn('Python file but IDE lacks Python support');
    // Either skip or find alternative IDE
}
```

## Troubleshooting Equivalence Issues

### Diagnostic Checklist

1. **Different inspection counts?**
    - Compare installed plugins
    - Check profile compatibility
    - Verify language support

2. **Different severity levels?**
    - Check profile configuration
    - Verify severity mappings
    - Look for IDE-specific overrides

3. **Missing inspections?**
    - Ensure required plugins installed
    - Check if inspection is language-specific
    - Verify IDE version compatibility

### Resolution Strategies

1. **Standardize on one IDE**: Use `FORCE_INSPECT_PATH`
2. **Create minimal profile**: Use only universal inspections
3. **Filter results**: Use `EXCLUDE_INSPECTIONS` or `ONLY_INSPECTIONS`
4. **Normalize output**: Post-process results for consistency

## Performance Comparison

### Relative Performance by IDE

| IDE           | Startup Time | Inspection Speed | Memory Usage |
| ------------- | ------------ | ---------------- | ------------ |
| WebStorm      | Fast         | Fast for JS/TS   | Medium       |
| IntelliJ IDEA | Slower       | Fast for Java    | High         |
| PyCharm       | Medium       | Fast for Python  | Medium       |
| CLion         | Slow         | Medium           | High         |
| GoLand        | Fast         | Fast for Go      | Low          |

### Optimization Tips

1. **Choose appropriate IDE**: Match IDE to primary language
2. **Limit scope**: Inspect only necessary files
3. **Increase timeout**: For large projects
4. **Use SSD**: Significantly improves performance

## Future Improvements

### Planned Enhancements

1. **Smart IDE selection**: Based on file types in project
2. **Result caching**: Cache inspection results
3. **Parallel execution**: Run multiple IDEs concurrently
4. **Cloud inspection**: Remote inspection service

### Community Contributions

Help improve cross-IDE support:

- Test with different IDE combinations
- Report inconsistencies
- Contribute IDE-specific optimizations
- Share custom profiles

## References

- [JetBrains IDE Comparison](https://www.jetbrains.com/products/compare/)
- [IntelliJ Platform Inspections](https://plugins.jetbrains.com/docs/intellij/code-inspections.html)
- [Language Plugin Development](https://plugins.jetbrains.com/docs/intellij/language-plugins.html)
