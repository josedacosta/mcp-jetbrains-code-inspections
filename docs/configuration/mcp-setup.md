---
sidebar_position: 4
title: MCP Setup
description: How to configure the MCP server in your client
---

# MCP Setup

This guide shows how to configure the MCP JetBrains Code Inspections server in various MCP clients.

## Claude Code Configuration

### Basic Setup

Add to your `.mcp.json` file:

```json
{
    "mcpServers": {
        "jetbrains-inspections": {
            "command": "node",
            "args": ["./dist/index.js"]
        }
    }
}
```

### With Environment Variables

```json
{
    "mcpServers": {
        "jetbrains-inspections": {
            "command": "node",
            "args": ["./dist/index.js"],
            "env": {
                "INSPECTION_TIMEOUT": "300000",
                "RESPONSE_FORMAT": "json",
                "EXCLUDE_INSPECTIONS": "SpellCheckingInspection,TodoComment"
            }
        }
    }
}
```

### Global Installation Setup

If you've installed globally with npm:

```json
{
    "mcpServers": {
        "jetbrains-inspections": {
            "command": "mcp-jetbrains-code-inspections"
        }
    }
}
```

## Development Setup

### Local Development

For development with `yarn dev`:

```json
{
    "mcpServers": {
        "jetbrains-inspections": {
            "command": "yarn",
            "args": ["dev"],
            "cwd": "/path/to/mcp-jetbrains-code-inspections"
        }
    }
}
```

### TypeScript Development

Using tsx directly:

```json
{
    "mcpServers": {
        "jetbrains-inspections": {
            "command": "npx",
            "args": ["tsx", "src/index.ts"],
            "cwd": "/path/to/mcp-jetbrains-code-inspections"
        }
    }
}
```

## Configuration Options

### Server Command

The command to run the server:

```json
{
    "command": "node",
    "args": ["./dist/index.js"]
}
```

**Options:**

- `"node"` + `["./dist/index.js"]` - Production build
- `"yarn"` + `["dev"]` - Development mode
- `"npx"` + `["tsx", "src/index.ts"]` - Direct TypeScript execution

### Working Directory

Set the working directory:

```json
{
    "cwd": "/path/to/mcp-jetbrains-code-inspections"
}
```

### Environment Variables

Configure server behavior:

```json
{
    "env": {
        "INSPECTION_TIMEOUT": "300000",
        "FORCE_INSPECT_PATH": "/custom/path/inspect.sh",
        "RESPONSE_FORMAT": "json",
        "DEBUG": "true"
    }
}
```

## Common Configurations

### Minimal Configuration

Simplest setup for testing:

```json
{
    "mcpServers": {
        "jetbrains-inspections": {
            "command": "node",
            "args": ["./dist/index.js"]
        }
    }
}
```

### Production Configuration

Optimized for production use:

```json
{
    "mcpServers": {
        "jetbrains-inspections": {
            "command": "node",
            "args": ["./dist/index.js"],
            "env": {
                "INSPECTION_TIMEOUT": "300000",
                "EXCLUDE_INSPECTIONS": "SpellCheckingInspection,TodoComment,UnusedDeclaration",
                "RESPONSE_FORMAT": "json"
            }
        }
    }
}
```

### Debug Configuration

For troubleshooting issues:

```json
{
    "mcpServers": {
        "jetbrains-inspections": {
            "command": "node",
            "args": ["./dist/index.js"],
            "env": {
                "DEBUG": "true",
                "INSPECTION_TIMEOUT": "600000"
            }
        }
    }
}
```

### Custom IDE Configuration

Force specific IDE usage:

```json
{
    "mcpServers": {
        "jetbrains-inspections": {
            "command": "node",
            "args": ["./dist/index.js"],
            "env": {
                "FORCE_INSPECT_PATH": "/Applications/WebStorm.app/Contents/bin/inspect.sh",
                "FORCE_PROJECT_ROOT": "/path/to/project"
            }
        }
    }
}
```

## Platform-Specific Setup

### macOS

```json
{
    "mcpServers": {
        "jetbrains-inspections": {
            "command": "node",
            "args": ["./dist/index.js"],
            "env": {
                "FORCE_INSPECT_PATH": "/Applications/IntelliJ IDEA.app/Contents/bin/inspect.sh"
            }
        }
    }
}
```

### Windows

```json
{
    "mcpServers": {
        "jetbrains-inspections": {
            "command": "node",
            "args": ["./dist/index.js"],
            "env": {
                "FORCE_INSPECT_PATH": "C:/Program Files/JetBrains/IntelliJ IDEA/bin/inspect.bat"
            }
        }
    }
}
```

### Linux

```json
{
    "mcpServers": {
        "jetbrains-inspections": {
            "command": "node",
            "args": ["./dist/index.js"],
            "env": {
                "FORCE_INSPECT_PATH": "/opt/idea/bin/inspect.sh"
            }
        }
    }
}
```

## Verification

### Test Server Connection

After configuration, test the connection:

1. Restart your MCP client
2. Check if the server appears in available tools
3. Try a simple inspection on a test file

### Debug Server Issues

Enable debug logging:

```json
{
    "env": {
        "DEBUG": "true"
    }
}
```

Check the MCP client logs for error messages.

### Common Issues

#### Server Not Found

1. Verify the path to `dist/index.js` is correct
2. Check that the build exists (`yarn build`)
3. Ensure Node.js is in your PATH

#### Tool Not Available

1. Restart the MCP client
2. Check the configuration file syntax
3. Verify environment variables are set correctly

#### Timeout Errors

1. Increase `INSPECTION_TIMEOUT`
2. Check IDE is properly installed
3. Try with smaller test files

## Multiple Server Configurations

You can configure multiple instances with different settings:

```json
{
    "mcpServers": {
        "jetbrains-java": {
            "command": "node",
            "args": ["./dist/index.js"],
            "env": {
                "FORCE_INSPECT_PATH": "/Applications/IntelliJ IDEA.app/Contents/bin/inspect.sh",
                "ONLY_INSPECTIONS": "NullPointerException,ArrayIndexOutOfBounds"
            }
        },
        "jetbrains-typescript": {
            "command": "node",
            "args": ["./dist/index.js"],
            "env": {
                "FORCE_INSPECT_PATH": "/Applications/WebStorm.app/Contents/bin/inspect.sh",
                "ONLY_INSPECTIONS": "TypeScriptValidateTypes,ES6MissingAwait"
            }
        }
    }
}
```

This allows different configurations optimized for different languages or use cases.

## Next Steps

After configuring your MCP server:

- Review [Environment Variables](./environment-variables) for detailed configuration options
- Check [Inspection Profiles](./inspection-profiles) for customizing analysis rules
- Try the [Quick Start Guide](../getting-started/quick-start) to test your setup
