---
sidebar_position: 2
title: JetBrains Resources
description: External JetBrains documentation and resources
---

# JetBrains Resources

## Table of Contents

1. [Overview](#overview)
2. [Inspectopedia and New Inspections](#inspectopedia-and-new-inspections)
3. [Default Inspection Profile](#default-inspection-profile)
4. [Command Line Usage (CLI)](#command-line-usage-cli)
5. [Severity Levels](#severity-levels)
6. [Profile Configuration](#profile-configuration)
7. [Additional Resources](#additional-resources)

## Overview

JetBrains code inspections are a set of static analysis tools integrated into all JetBrains IDEs (IntelliJ IDEA, WebStorm, PyCharm, etc.) that detect:

- Syntax errors
- Dead code
- Potential bugs
- Poor coding style
- Performance issues
- Convention violations

## Inspectopedia and New Inspections

### Main Resource

- **URL**: https://www.jetbrains.com/help/inspectopedia/
- **Description**: Catalog of new inspections added in recent versions

### New JVM Inspections (Latest Version)

1. **ActionUpdateThread is Missing**
    - Reports actions and action groups that don't explicitly declare their mode

2. **Component/Action Not Registered**
    - Identifies plugin components and actions not registered in plugin.xml

3. **Extension Class Requirements**
    - Verifies that extension classes are `final` and non-public
    - Warns about extensions registered as services/components

4. **Inspection and Intention Description Checkers**
    - Detects inspections without HTML description files
    - Verifies intentions without description or template files

5. **Service and Listener Implementations**
    - Verifies that lightweight services are `final`
    - Warns about listener implementations that implement `Disposable`

6. **JComponent Validation**
    - Ensures JComponent classes use proper data provider interfaces

## Default Inspection Profile

### Resource

- **URL**: https://github.com/JetBrains/intellij-community/blob/master/.idea/inspectionProfiles/idea_default.xml
- **Description**: IntelliJ IDEA Community default inspection profile

### XML Profile Structure

```xml
<component name="InspectionProjectProfileManager">
  <profile version="1.0">
    <option name="myName" value="idea.default" />
    <inspection_tool class="InspectionName" enabled="true" level="WARNING" enabled_by_default="true">
      <option name="optionName" value="optionValue" />
      <scope name="Production" level="ERROR" enabled="true" />
    </inspection_tool>
  </profile>
</component>
```

### Main Inspection Categories

- Java code style and potential issues
- Synchronization and threading checks
- Naming conventions
- Nullable/null related issues
- Performance and redundancy warnings
- Plugin and XML validation
- Test-related inspections

## Command Line Usage (CLI)

### Official Documentation

- **IntelliJ IDEA**: https://www.jetbrains.com/help/idea/command-line-code-inspector.html
- **Rider (InspectCode)**: https://www.jetbrains.com/help/rider/InspectCode.html
- **CLion**: https://www.jetbrains.com/help/clion/command-line-code-inspector.html

### Basic Syntax

#### Windows

```bash
idea64.exe inspect <project> <inspection-profile> <output> [<options>]
```

#### macOS

```bash
inspect.sh <project> <inspection-profile> <output> [<options>]
```

#### Linux

```bash
idea.sh inspect <project> <inspection-profile> <output> [<options>]
```

### Complete Example

```bash
# Windows
idea64.exe inspect C:\MyProject C:\MyProject\.idea\inspectionProfiles\MyProfile.xml C:\MyProject\InspectionResults -v2 -d C:\MyProject\src

# macOS/Linux
inspect.sh ~/MyProject ~/MyProject/.idea/inspectionProfiles/MyProfile.xml ~/MyProject/InspectionResults -v2 -d ~/MyProject/src
```

### Main Parameters

- **`<project>`**: Path to the project to inspect
- **`<inspection-profile>`**: Inspection profile XML file
- **`<output>`**: Output directory for results
- **`-v[0|1|2]`**: Verbosity level (0=quiet, 1=verbose, 2=very verbose)
- **`-d`**: Specific directory to inspect (optional)
- **`-changes`**: Inspect only uncommitted changes
- **`-format`**: Output format (xml, json, plain)

### Alternative Tools

#### ReSharper Command Line Tools (InspectCode)

```bash
# Installation via .NET tools
dotnet tool install -g JetBrains.ReSharper.GlobalTools

# Usage
jb inspectcode YourSolution.sln -o=<output-file>
```

### Important Notes

1. Uses isolated configuration directories for conflict-free execution
2. Requires properly defined project SDK
3. Runs inspections in the background without UI

**Note**: Thanks to our implementation using `-Didea.config.path` and `-Didea.system.path`, inspections work seamlessly even when the IDE is already
running for development.

## Severity Levels

### Predefined Levels

1. **ERROR**
    - Issues preventing compilation or causing runtime errors
    - Generally not configurable

2. **WARNING**
    - Corresponds to compiler warnings
    - Serious code efficiency issues

3. **WEAK WARNING**
    - Insights about code structure
    - Not necessarily bad but useful to know

4. **INFORMATION**
    - Suggestions and possible improvements

5. **TYPO**
    - Lowest level
    - Details and improvement recommendations

### Configuring Severity Levels

#### Via IDE Settings

1. Open Settings/Preferences (`Ctrl+Alt+S`)
2. Navigate to Editor → Inspections
3. Select profile and inspection
4. Change level in Severity list

#### From the Editor

1. Place cursor on detected issue
2. Press `Alt+Enter`
3. Modify severity directly

#### Via EditorConfig

```editorconfig
# .editorconfig
[*.java]
resharper_java_naming_rule_violation = error
resharper_java_unused_variable = warning
```

## Profile Configuration

### Creating a Custom Profile

1. Go to Settings → Editor → Inspections
2. Click gear icon → Duplicate
3. Name the new profile
4. Customize inspections

### Custom XML Profile Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<component name="InspectionProjectProfileManager">
  <profile version="1.0">
    <option name="myName" value="Custom Profile" />

    <!-- Disable an inspection -->
    <inspection_tool class="UnusedDeclaration" enabled="false" level="WARNING" enabled_by_default="false" />

    <!-- Modify severity -->
    <inspection_tool class="NullableProblems" enabled="true" level="ERROR" enabled_by_default="true">
      <option name="REPORT_ANNOTATION_NOT_PROPAGATED_TO_OVERRIDERS" value="true" />
    </inspection_tool>

    <!-- Scope configuration -->
    <inspection_tool class="SpellCheckingInspection" enabled="true" level="TYPO" enabled_by_default="true">
      <scope name="Production" level="WARNING" enabled="true" />
      <scope name="Tests" level="INFORMATION" enabled="true" />
    </inspection_tool>
  </profile>
</component>
```

### Available Scopes

- **Production**: Production code
- **Tests**: Test code
- **Project Files**: All project files
- **Scratches and Consoles**: Temporary files
- User-defined custom scopes

## Additional Resources

### Official JetBrains Documentation

1. **Code Inspections Overview**
    - IntelliJ IDEA: https://www.jetbrains.com/help/idea/code-inspection.html
    - WebStorm: https://www.jetbrains.com/help/webstorm/code-inspection.html
    - PyCharm: https://www.jetbrains.com/help/pycharm/code-inspection.html

2. **Running Inspections**
    - https://www.jetbrains.com/help/idea/running-inspections.html

3. **Inspection Settings**
    - https://www.jetbrains.com/help/idea/inspections-settings.html

### GitHub and Open Source

1. **IntelliJ Community Source**
    - Repository: https://github.com/JetBrains/intellij-community
    - Inspections: `/platform/analysis-api/src/com/intellij/codeInspection/`

2. **Inspection Profiles Examples**
    - Default profiles: `/.idea/inspectionProfiles/`

### Forums and Support

1. **JetBrains Support**
    - https://intellij-support.jetbrains.com/hc/en-us/community/topics/200366979-IntelliJ-IDEA-Open-API-and-Plugin-Development

2. **Stack Overflow**
    - Tag: `intellij-inspections`

### CI/CD Integration

1. **TeamCity Integration**
    - https://www.jetbrains.com/help/teamcity/inspections.html

2. **GitHub Actions**
    - Marketplace: https://github.com/marketplace?type=actions&query=jetbrains+inspections

### Plugin Development

1. **Creating Custom Inspections**
    - https://plugins.jetbrains.com/docs/intellij/code-inspections.html

2. **Inspection Description Format**
    - HTML templates for custom inspection descriptions

## Best Practices

### For Teams

1. **Share Profiles**
    - Version control `.idea/inspectionProfiles/` files
    - Use a common team profile

2. **CI/CD Integration**
    - Run inspections in pipelines
    - Block PRs with critical errors

3. **Progressive Training**
    - Start with ERROR inspections only
    - Progressively add WARNING and WEAK WARNING

### Performance

1. **Inspection Optimization**
    - Disable irrelevant inspections
    - Use scopes to limit analysis
    - Configure exclusions for generated files

2. **CLI Usage**
    - Use `-d` to analyze specific directories
    - JSON format for integration with other tools
    - Parallelize analysis of large projects

## Advanced Usage Examples

### Bash Script for Automatic Analysis

```bash
#!/bin/bash
PROJECT_PATH="/path/to/project"
PROFILE_PATH="$PROJECT_PATH/.idea/inspectionProfiles/Project_Default.xml"
OUTPUT_PATH="$PROJECT_PATH/inspection-results"
IDEA_PATH="/Applications/IntelliJ IDEA.app/Contents/bin/inspect.sh"

# Create output directory
mkdir -p "$OUTPUT_PATH"

# Run inspection
"$IDEA_PATH" "$PROJECT_PATH" "$PROFILE_PATH" "$OUTPUT_PATH" -v2 -format json

# Analyze results
if [ -f "$OUTPUT_PATH/report.json" ]; then
    ERROR_COUNT=$(jq '[.problems[] | select(.severity == "ERROR")] | length' "$OUTPUT_PATH/report.json")
    if [ $ERROR_COUNT -gt 0 ]; then
        echo "Found $ERROR_COUNT errors!"
        exit 1
    fi
fi
```

### GitHub Actions Integration

```yaml
name: Code Inspection
on: [push, pull_request]

jobs:
    inspect:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v2

            - name: Setup JDK
              uses: actions/setup-java@v2
              with:
                  java-version: '11'

            - name: Run IntelliJ Inspections
              run: |
                  wget -q https://download.jetbrains.com/idea/ideaIC-2023.3.tar.gz
                  tar -xzf ideaIC-2023.3.tar.gz
                  ./idea-IC-*/bin/inspect.sh \
                    ${{ github.workspace }} \
                    .idea/inspectionProfiles/Project_Default.xml \
                    inspection-results \
                    -v2 -format json

            - name: Upload Results
              uses: actions/upload-artifact@v2
              with:
                  name: inspection-results
                  path: inspection-results/
```

## Conclusion

JetBrains inspections offer a powerful and flexible system for maintaining code quality. Command-line usage enables CI/CD workflow integration, while
fine-grained profile configuration allows analysis tailored to each project's specific needs.

To stay up to date with the latest features, regularly consult:

- Official documentation for your JetBrains IDE
- Release notes for new inspections
- Community forums for best practices
