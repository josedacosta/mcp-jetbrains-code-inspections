---
sidebar_position: 2
title: Architecture
description: System architecture and technical design overview
---

# System Architecture

## Overview

This document provides an in-depth technical analysis of how JetBrains IDEs perform code inspections and why results are consistent across different
IDEs and invocation methods.

The MCP server provides the `get_jetbrains_code_inspections` tool which takes a single `path` parameter and uses environment variables for all
configuration options.

## Inspection System Architecture

### Core Components

#### 1. PSI (Program Structure Interface)

The PSI is the foundation of all code analysis in JetBrains IDEs:

```
Source Code → Lexer → Parser → PSI Tree → Inspections
```

- **Lexer**: Tokenizes source code
- **Parser**: Builds Abstract Syntax Tree
- **PSI Tree**: Platform-independent code representation
- **Inspections**: Analyze PSI tree for issues

#### 2. Inspection Registry

All inspections are registered in a central registry:

```java
// Pseudo-code representation
class InspectionRegistry {
    Map<String, InspectionTool> inspections = new HashMap<>();

    void registerInspection(String id, InspectionTool tool) {
        inspections.put(id, tool);
    }

    InspectionTool getInspection(String id) {
        return inspections.get(id);
    }
}
```

#### 3. Inspection Profile System

Profiles control which inspections run and their severity:

```xml
<profile>
  <inspection_tool class="JSUnusedLocalSymbols" enabled="true" level="WARNING" enabled_by_default="true">
    <option name="LOCAL_VARIABLE" value="true" />
    <option name="PARAMETER" value="true" />
  </inspection_tool>
</profile>
```

### Command-Line Inspector Implementation

The `inspect.sh` script is a thin wrapper around the IDE's inspection engine:

```bash
#!/bin/sh
# Simplified representation of inspect.sh

IDE_HOME=$(dirname "$0")/..
CLASSPATH="$IDE_HOME/lib/*"

java -cp "$CLASSPATH" \
  com.intellij.codeInspection.CommandLineInspectionProjectConfigurator \
  "$@"
```

This Java class:

1. Loads the project model
2. Reads inspection profiles
3. Executes inspections
4. Outputs results

## Inspection Execution Flow

### 1. Project Loading Phase

```
inspect.sh called
     ↓
Load project from .idea/
     ↓
Initialize project indices
     ↓
Load inspection profile
     ↓
Prepare file list for analysis
```

### 2. Analysis Phase

```
For each file:
    ↓
Parse file to PSI
    ↓
For each enabled inspection:
    ↓
Run inspection visitor
    ↓
Collect problems
    ↓
Apply severity levels
```

### 3. Reporting Phase

```
Aggregate all problems
    ↓
Group by file/severity
    ↓
Format output (XML/JSON/Plain)
    ↓
Write to output directory
```

## Configuration Deep Dive

### .idea Directory Structure

```
.idea/
├── .name                          # Project name
├── modules.xml                    # Module configuration
├── vcs.xml                       # Version control settings
├── workspace.xml                 # User-specific settings (ignored by inspect.sh)
├── codeStyles/
│   ├── codeStyleConfig.xml      # Active code style scheme
│   └── Project.xml              # Project code style
├── inspectionProfiles/
│   ├── profiles_settings.xml    # Active profile selection
│   └── Project_Default.xml      # Project inspection profile
├── jsLinters/
│   └── eslint.xml              # ESLint integration settings
└── libraries/                   # Project libraries
```

### Critical Files for Inspection Consistency

1. **inspectionProfiles/Project_Default.xml**
    - Defines which inspections are enabled
    - Sets severity levels
    - Contains inspection-specific options

2. **jsLinters/eslint.xml**
    - ESLint executable path
    - Configuration file location
    - Additional ESLint options

3. **modules.xml**
    - Defines project structure
    - Source folders
    - Excluded directories

### How Settings Are Applied

```typescript
// Conceptual representation of settings loading
class InspectionRunner {
    loadProject(projectPath: string) {
        const ideaDir = path.join(projectPath, '.idea');

        // Load modules
        const modules = this.loadXML(path.join(ideaDir, 'modules.xml'));

        // Load inspection profile
        const profilePath = this.findActiveProfile(ideaDir);
        const profile = this.loadXML(profilePath);

        // Load code style
        const codeStyle = this.loadXML(path.join(ideaDir, 'codeStyles', 'Project.xml'));

        // Apply all settings
        this.applyConfiguration(modules, profile, codeStyle);
    }
}
```

## Language-Specific Inspections

### JavaScript/TypeScript Inspections

JetBrains IDEs include built-in inspections for JS/TS:

| Inspection Category    | Examples                             |
| ---------------------- | ------------------------------------ |
| **Syntax**             | Missing semicolons, invalid syntax   |
| **Semantics**          | Undefined variables, type mismatches |
| **Best Practices**     | Unreachable code, unused symbols     |
| **Style**              | Naming conventions, formatting       |
| **Framework-Specific** | React hooks rules, Vue templates     |

### ESLint Integration

When ESLint inspection is enabled:

```xml
<inspection_tool class="Eslint" enabled="true" level="WARNING" enabled_by_default="true" />
```

The inspection engine:

1. Locates ESLint executable
2. Finds `.eslintrc` configuration
3. Runs ESLint as subprocess
4. Parses ESLint output
5. Converts to inspection results

## Cross-IDE Compatibility

### Shared Resources

All JetBrains IDEs share:

```
$IDE_HOME/
├── plugins/
│   ├── JavaScript/          # JS/TS support
│   ├── JavaScriptDebugger/  # Debugging support
│   ├── ESLint/             # ESLint integration
│   └── ...
├── lib/
│   ├── platform-api.jar    # Core platform APIs
│   ├── platform-impl.jar   # Platform implementation
│   └── ...
```

### Plugin Architecture

Language support is implemented as plugins:

```java
// Simplified plugin structure
public class JavaScriptInspectionProvider {
    List<InspectionTool> getInspections() {
        return Arrays.asList(
            new JSUnusedLocalSymbolsInspection(),
            new JSUnreachableCodeInspection(),
            new TypeScriptValidateTypesInspection(),
            // ... hundreds more
        );
    }
}
```

These plugins are:

- Identical across IDEs
- Loaded dynamically
- Version-synchronized

## Performance Considerations

### Incremental Analysis

The `-d` flag enables directory-specific analysis:

```bash
inspect.sh project profile output -d src/components
```

This improves performance by:

- Analyzing only specified directory
- Reducing memory usage
- Faster execution time

### Caching Mechanisms

IDEs cache various data for performance:

1. **File indices** - Not used by CLI inspector
2. **PSI cache** - Rebuilt for each CLI run
3. **Inspection results** - Not cached in CLI mode

This means CLI inspection is slower but guarantees fresh results.

## Verification Methods

### 1. Checksum Verification

Compare inspection results by checksum:

```bash
# Run inspection with WebStorm
./inspect.sh project profile output1 -format json
find output1 -name "*.json" -exec md5sum {} \; | sort > webstorm.md5

# Run inspection with IntelliJ
./inspect.sh project profile output2 -format json
find output2 -name "*.json" -exec md5sum {} \; | sort > intellij.md5

# Compare
diff webstorm.md5 intellij.md5
```

### 2. Detailed Diff Analysis

```bash
# Use jq for JSON comparison
jq -S . output1/MyFile.json > sorted1.json
jq -S . output2/MyFile.json > sorted2.json
diff sorted1.json sorted2.json
```

### 3. Automated Testing

Create automated tests to verify consistency:

```typescript
describe('Inspection Consistency', () => {
    it('should produce identical results across IDEs', async () => {
        const webstormResults = await runInspection('webstorm');
        const intellijResults = await runInspection('intellij');

        expect(webstormResults).toEqual(intellijResults);
    });
});
```

## Troubleshooting

### Common Issues

1. **Different Results Between IDEs**
    - Check IDE versions match
    - Verify same plugins installed
    - Ensure identical `.idea` configuration

2. **GUI vs CLI Differences**
    - Workspace-specific settings ignored in CLI
    - Real-time analysis features not available in CLI
    - Quick-fixes not computed in CLI mode

3. **Performance Issues**
    - Use `-d` flag for partial analysis
    - Increase JVM heap size
    - Exclude unnecessary directories

## External Resources

For official JetBrains documentation on code inspections:

- **[Code Inspection Overview](https://www.jetbrains.com/help/webstorm/code-inspection.html)**
    - Complete guide to understanding code inspections
    - Severity levels and inspection profiles
    - How to configure and customize inspections
    - Integration with external tools

- **[Command-Line Code Inspector](https://www.jetbrains.com/help/webstorm/command-line-code-inspector.html)**
    - Official documentation for inspect.sh/inspect.bat
    - Command syntax and parameters
    - Output formats and report analysis
    - Automation and CI/CD integration

## Conclusion

The JetBrains inspection system is designed for consistency across all invocation methods. By understanding the underlying architecture and
configuration system, you can confidently use any JetBrains IDE's inspection tool with guaranteed identical results.
