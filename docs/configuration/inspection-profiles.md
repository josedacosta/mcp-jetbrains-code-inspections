---
sidebar_position: 3
title: Inspection Profiles
description: Configure and manage inspection profiles for code analysis
---

# Inspection Profiles

Inspection profiles define which checks are performed when analyzing your code.

## How Profiles Work

Inspection profiles are XML files that define which code inspections are enabled and their severity levels. JetBrains IDEs use these profiles to
determine what issues to report during code analysis.

## Creating a Custom Profile

1. Open your JetBrains IDE
2. Go to **Settings → Editor → Inspections**
3. Configure inspections according to your needs
4. Export the profile via **Manage → Export**
5. Save the XML file to your project (e.g., in `.idea/inspectionProfiles/`)
6. Reference it using the `FORCE_PROFILE_PATH` environment variable

## Using a Profile

The MCP server uses inspection profiles in the following way:

```javascript
// The tool analyzes files with configured profiles
const result = await get_jetbrains_code_inspections({
    path: '/path/to/file.ts',
});
```

## Profile Configuration

**Important**: Automatic profile detection based on file extension has been removed. The system now uses:

1. **Custom profile** specified via `FORCE_PROFILE_PATH` environment variable
2. **Project defaults** using the `-e` flag when no profile is specified
3. **No automatic detection** - Either provide an explicit profile path or use project defaults

## Best Practices

- **Consistency**: Use the same profile for the entire project
- **Performance**: Disable unnecessary inspections
- **Evolution**: Update profiles regularly
- **Documentation**: Document reasons for specific configurations

## Environment Variable Configuration

You can control profile behavior with these environment variables:

- `FORCE_PROFILE_PATH`: Force a specific inspection profile path
- `EXCLUDE_INSPECTIONS`: Comma-separated inspection codes to exclude
- `ONLY_INSPECTIONS`: Comma-separated inspection codes to include only

Example:

```bash
export EXCLUDE_INSPECTIONS="SpellCheckingInspection,TodoComment"
export ONLY_INSPECTIONS="TypeScriptValidateTypes,UnusedDeclaration"
```
