---
sidebar_position: 2
title: Multi-IDE Usage
description: Using different JetBrains IDEs for code analysis
---

# Cross-IDE Usage for Diagnostics

## The Revolutionary Concept

Our MCP server can use **ANY JetBrains IDE** to perform code inspections, not just WebStorm. Thanks to isolated configuration directories, inspections
can run even when the IDE is already open.

## Usage Scenarios

### Scenario 1: WebStorm is Open

```
WebStorm: RUNNING ✅ (editing code)
→ Still used for diagnostics with isolated configuration
```

### Scenario 2: Priority-Based Selection

```
WebStorm: Available ✅ → Selected (highest priority for JS/TS)
IntelliJ IDEA: Available ✅
PyCharm: Available ✅
```

### Scenario 3: Forced IDE Selection

```bash
# Force GoLand usage regardless of other available IDEs
export FORCE_INSPECT_PATH="/Applications/GoLand.app/Contents/bin/inspect.sh"
```

## How It Works: Isolated Configuration

The server uses JVM properties to create isolated configuration directories:

```bash
-Didea.config.path=/tmp/mcp-config-xxxxx
-Didea.system.path=/tmp/mcp-system-xxxxx
```

This means:

- ✅ **No conflicts** with running IDE instances
- ✅ **Always works** even if IDE is being used for development
- ✅ **Clean isolation** - temporary directories are created and cleaned up

## Supported IDEs

All JetBrains IDEs can analyze JavaScript/TypeScript projects:

| IDE           | Primary Language | JS/TS Support |
| ------------- | ---------------- | ------------- |
| IntelliJ IDEA | Java             | ✅ Full       |
| WebStorm      | JavaScript       | ✅ Native     |
| PyCharm       | Python           | ✅ Full       |
| PhpStorm      | PHP              | ✅ Full       |
| GoLand        | Go               | ✅ Full       |
| Rider         | C#/.NET          | ✅ Full       |
| CLion         | C/C++            | ✅ Basic      |
| RubyMine      | Ruby             | ✅ Full       |
| DataGrip      | SQL              | ✅ Basic      |
| DataSpell     | Data Science     | ✅ Full       |
| AppCode       | iOS/macOS        | ✅ Basic      |

## How to Test

### 1. Verify Available IDEs

Enable debug mode to see which IDEs are detected:

```bash
DEBUG=true yarn test:mcp --path ./src
```

### 2. Test MCP Server

```bash
# Using MCP Inspector
yarn inspect

# Using interactive test script
yarn test:mcp

# Or force specific IDE
FORCE_INSPECT_PATH="/Applications/GoLand.app/Contents/bin/inspect.sh" yarn inspect
```

### 3. Run MCP Server

```bash
# Development mode with automatic selection
yarn dev

# Production mode
yarn start

# Or force specific IDE
FORCE_INSPECT_PATH="/Applications/PyCharm.app/Contents/bin/inspect.sh" yarn start
```

## Technical Details

### Shared Components

All JetBrains IDEs share:

- **IntelliJ Platform**: Common foundation
- **Language Plugins**: JavaScript/TypeScript support
- **Inspection Engine**: Same code analysis
- **Project Model**: .idea directory structure

### Inspection Profiles

The `.idea/inspectionProfiles/` directory is read identically by all IDEs, ensuring consistent results.

### Performance

No performance difference between IDEs - the same inspection engine runs regardless of which IDE binary launches it.

## Best Practices

1. **Let the system choose**: The automatic selection works well in most cases
2. **Install IntelliJ IDEA CE**: Free and always useful as a backup
3. **Use environment variable**: For CI/CD or specific requirements
4. **Check before running**: Use `yarn check:ide` to verify setup

## FAQ

**Q: Will PyCharm give the same JavaScript results as WebStorm?**
A: Yes, 100% identical results. They use the same inspection engine.

**Q: Can I use DataGrip for JavaScript inspection?**
A: Yes, though it's optimized for SQL. Better to use IDEs with full JS support.

**Q: What if I only have WebStorm installed?**
A: Install IntelliJ IDEA Community Edition (free) as a backup inspection tool.

**Q: Does the IDE choice affect inspection speed?**
A: No, the inspection engine performance is identical across all IDEs.

## Troubleshooting

### "No available IDE found"

1. Enable debug to see IDE detection: `DEBUG=true yarn test:mcp`
2. Verify IDE installation paths
3. Use `FORCE_INSPECT_PATH` for custom IDE locations
4. Install IntelliJ IDEA CE as fallback option

### "Permission denied"

Ensure inspect.sh is executable:

```bash
chmod +x "/Applications/YourIDE.app/Contents/bin/inspect.sh"
```

### Different Results Between IDEs

This should not happen. If it does:

1. Ensure all IDEs are updated to the same version
2. Check that they're reading the same `.idea` directory
3. Verify the inspection profile is identical
