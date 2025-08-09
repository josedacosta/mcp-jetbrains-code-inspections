---
sidebar_position: 3
title: IDE Detection
description: How the system detects and selects JetBrains IDEs
---

# IDE Detection System

The MCP JetBrains Code Inspections server includes a sophisticated IDE detection system that automatically finds and selects the most appropriate
JetBrains IDE for code analysis.

## Detection Process

### 1. Platform Detection

The system first identifies the operating system and searches IDE installation locations:

#### macOS

- **Applications Directory**: `/Applications/[IDE Name].app/Contents/bin/inspect.sh`
- **User Applications**: `~/Applications/[IDE Name].app/Contents/bin/inspect.sh`
- **Homebrew Installs**: `/usr/local/Caskroom/[ide]/*/[IDE Name].app/Contents/bin/inspect.sh`

#### Windows

- **Program Files**: `C:\Program Files\JetBrains\[IDE Name]\bin\inspect.bat`
- **Program Files (x86)**: `C:\Program Files (x86)\JetBrains\[IDE Name]\bin\inspect.bat`
- **User AppData**: `%LOCALAPPDATA%\JetBrains\Toolbox\apps\[ide]\ch-0\*\bin\inspect.bat`

#### Linux

- **Snap Packages**: `/snap/[ide]/current/bin/inspect.sh`
- **Flatpak**: `~/.local/share/flatpak/app/com.jetbrains.[IDE]/current/active/files/bin/inspect.sh`
- **Manual Installs**: `/opt/[ide]/bin/inspect.sh`
- **Home Directory**: `~/[ide]/bin/inspect.sh`

### 2. IDE Discovery

The system searches for these JetBrains IDEs in priority order:

| Priority | IDE            | Binary Pattern                 | Languages Supported                                   |
| -------- | -------------- | ------------------------------ | ----------------------------------------------------- |
| 1        | IntelliJ IDEA  | `idea*/bin/inspect.*`          | Java, Kotlin, Scala, JavaScript, TypeScript, and more |
| 2        | WebStorm       | `webstorm*/bin/inspect.*`      | JavaScript, TypeScript, HTML, CSS, Vue, React         |
| 3        | PyCharm        | `pycharm*/bin/inspect.*`       | Python, Django, Flask, HTML, CSS, JavaScript          |
| 4        | PhpStorm       | `phpstorm*/bin/inspect.*`      | PHP, HTML, CSS, JavaScript, SQL                       |
| 5        | GoLand         | `goland*/bin/inspect.*`        | Go, JavaScript, TypeScript, HTML, CSS                 |
| 6        | RubyMine       | `rubymine*/bin/inspect.*`      | Ruby, Rails, JavaScript, HTML, CSS                    |
| 7        | CLion          | `clion*/bin/inspect.*`         | C, C++, Rust, Python, JavaScript                      |
| 8        | Rider          | `rider*/bin/inspect.*`         | C#, F#, VB.NET, JavaScript, TypeScript                |
| 9        | DataGrip       | `datagrip*/bin/inspect.*`      | SQL, JavaScript, Python                               |
| 10       | DataSpell      | `dataspell*/bin/inspect.*`     | Python, Jupyter, Data Science                         |
| 11       | AppCode        | `appcode*/bin/inspect.*`       | Swift, Objective-C, C, C++                            |
| 12       | Android Studio | `android-studio/bin/inspect.*` | Kotlin, Java, C++, XML                                |
| 13       | RustRover      | `rustrover*/bin/inspect.*`     | Rust                                                  |
| 14       | Aqua           | `aqua*/bin/inspect.*`          | Test Automation, Various Languages                    |
| 15       | Writerside     | `writerside*/bin/inspect.*`    | Markdown, Technical Documentation                     |

### 3. IDE Validation

For each discovered IDE, the system validates:

1. **File Existence**: Verify the inspect tool exists
2. **Execute Permissions**: Check if the tool is executable
3. **Version Compatibility**: Ensure minimum version requirements

### 4. Selection Logic

The system selects an IDE using priority-based logic:

```typescript
function selectIDE(detectedIDEs: IDE[]): IDE | null {
    // Sort by priority (lower number = higher priority)
    const sortedIDEs = detectedIDEs.sort((a, b) => a.priority - b.priority);

    // Return the highest priority IDE
    // All IDEs work thanks to isolated configuration
    return sortedIDEs[0] || null;
}
```

**Note**: The system uses isolated configuration directories, so inspections always work regardless of whether the IDE is already running.

## Configuration Override

### Manual IDE Selection

Force specific IDE using environment variable:

```json
{
    "env": {
        "FORCE_INSPECT_PATH": "/Applications/WebStorm.app/Contents/bin/inspect.sh"
    }
}
```

### Project Root Override

Force specific project root:

```json
{
    "env": {
        "FORCE_PROJECT_ROOT": "/path/to/project"
    }
}
```

## Advanced Features

### 1. Multi-Version Support

The system can detect and use multiple versions of the same IDE:

```
/Applications/IntelliJ IDEA.app/Contents/bin/inspect.sh (2023.3)
/Applications/IntelliJ IDEA 2024.1.app/Contents/bin/inspect.sh (2024.1)
```

Selection preference:

1. Latest version (based on path/name analysis)
2. Currently installed version
3. Version with best language support for the project

### 2. Instance Isolation

The system **always** uses isolated configuration directories for inspections:

```bash
inspect.sh \
  -Didea.config.path=/tmp/mcp-jetbrains-config-12345 \
  -Didea.system.path=/tmp/mcp-jetbrains-system-12345 \
  /path/to/project \
  /path/to/profile.xml \
  /tmp/results-67890
```

This ensures:

- ✅ Inspections work even if the IDE is already running
- ✅ No conflicts with development IDE instances
- ✅ Multiple concurrent inspections are possible
- ✅ Clean temporary directories that are automatically cleaned up

### 3. Toolbox Integration

Special handling for JetBrains Toolbox installations:

#### macOS Toolbox

```
~/Library/Application Support/JetBrains/Toolbox/apps/[ide]/ch-0/*/Contents/bin/inspect.sh
```

#### Windows Toolbox

```
%LOCALAPPDATA%\JetBrains\Toolbox\apps\[ide]\ch-0\*\bin\inspect.bat
```

#### Linux Toolbox

```
~/.local/share/JetBrains/Toolbox/apps/[ide]/ch-0/*/bin/inspect.sh
```

## Error Handling

### No IDEs Found

When no JetBrains IDEs are detected:

```json
{
    "error": "No suitable JetBrains IDE found. Please install a JetBrains IDE or set FORCE_INSPECT_PATH environment variable.",
    "suggestions": [
        "Install IntelliJ IDEA, WebStorm, PyCharm, or another JetBrains IDE",
        "Set FORCE_INSPECT_PATH to point to your IDE's inspect tool",
        "Verify IDE installation and command-line tools are available"
    ]
}
```

### IDE Selection Success

When an IDE is selected:

```json
{
    "selectedIDE": "IntelliJ IDEA",
    "isolationMode": true,
    "note": "Using isolated configuration - works regardless of IDE state"
}
```

### Invalid IDE Path

When forced IDE path is invalid:

```json
{
    "error": "Forced IDE path does not exist or is not executable: /invalid/path/inspect.sh",
    "suggestion": "Verify the FORCE_INSPECT_PATH points to a valid JetBrains IDE inspect tool"
}
```

## Platform-Specific Considerations

### macOS

- **App Bundle Structure**: IDEs are packaged as `.app` bundles
- **Code Signing**: Inspect tools may require proper code signing
- **Gatekeeper**: First-time execution may require security approval
- **Symlinks**: Some installations use symlinks to binaries

### Windows

- **Registry Detection**: Check Windows Registry for installation paths
- **UAC Permissions**: May require elevated permissions for some operations
- **Path Length Limits**: Handle long path names in deep directory structures
- **File Extensions**: Use `.bat` files instead of shell scripts

### Linux

- **Package Managers**: Support for snap, flatpak, AppImage
- **Distribution Variations**: Different default installation paths
- **Permissions**: Ensure execute permissions on install binaries
- **Desktop Integration**: Check desktop entry files for IDE locations

## Performance Optimization

### 1. Caching

IDE detection results are cached to improve performance:

```typescript
interface IDECache {
    timestamp: number;
    detectedIDEs: IDE[];
    selectedIDE: IDE | null;
    ttl: number; // Time to live in milliseconds
}
```

Cache is invalidated:

- After 5 minutes (default TTL)
- When environment variables change
- When forced IDE path is updated

### 2. Parallel Detection

Multiple IDE locations are searched in parallel:

```typescript
async function detectIDEs(): Promise<IDE[]> {
    const searchPaths = getPlatformSearchPaths();

    const detectionPromises = searchPaths.map(async (path) => {
        try {
            return await validateIDEPath(path);
        } catch (error) {
            return null; // IDE not found at this path
        }
    });

    const results = await Promise.allSettled(detectionPromises);

    return results
        .filter((result): result is PromiseFulfilledResult<IDE> => result.status === 'fulfilled' && result.value !== null)
        .map((result) => result.value);
}
```

### 3. Lazy Loading

IDE validation is performed lazily to reduce startup time:

1. Quick path existence check during discovery
2. Full validation (permissions, version) only when selecting
3. All IDEs work regardless of running status thanks to isolation

## Debugging IDE Detection

### Enable Debug Logging

```json
{
    "env": {
        "DEBUG": "true"
    }
}
```

### Debug Output Example

```
[DEBUG] IDE Detection starting...
[DEBUG] Platform: darwin
[DEBUG] Search paths: [
  "/Applications/IntelliJ IDEA.app/Contents/bin/inspect.sh",
  "/Applications/WebStorm.app/Contents/bin/inspect.sh",
  "/Applications/PyCharm.app/Contents/bin/inspect.sh"
]
[DEBUG] Found IDE: IntelliJ IDEA at /Applications/IntelliJ IDEA.app/Contents/bin/inspect.sh
[DEBUG] Found IDE: WebStorm at /Applications/WebStorm.app/Contents/bin/inspect.sh
[DEBUG] Validating IDEs...
[DEBUG] IntelliJ IDEA: ✓ exists, ✓ executable
[DEBUG] WebStorm: ✓ exists, ✓ executable
[DEBUG] Selected IDE: WebStorm (priority: 2)
[DEBUG] Using isolated configuration for conflict-free execution
```

## Extending IDE Detection

### Adding New IDEs

To add support for a new JetBrains IDE:

1. **Add IDE Definition**:

```typescript
const NEW_IDE: IDEDefinition = {
    name: 'DataSpell',
    priority: 10,
    binaryPatterns: ['dataspell*/bin/inspect.*'],
    supportedLanguages: ['python', 'jupyter', 'sql'],
    searchPaths: {
        darwin: ['/Applications/DataSpell.app/Contents/bin/inspect.sh'],
        win32: ['C:/Program Files/JetBrains/DataSpell/bin/inspect.bat'],
        linux: ['/opt/dataspell/bin/inspect.sh'],
    },
};
```

2. **Register IDE**:

```typescript
registerIDE(NEW_IDE);
```

### Custom Detection Logic

Implement custom detection for special cases:

```typescript
class CustomIDEDetector implements IDEDetector {
    async detect(): Promise<IDE[]> {
        // Custom detection logic
        return detectedIDEs;
    }

    async validate(ide: IDE): Promise<boolean> {
        // Custom validation logic
        return isValid;
    }
}
```

The IDE detection system is designed to be robust, extensible, and provide the best possible development experience across different platforms and IDE
configurations.
