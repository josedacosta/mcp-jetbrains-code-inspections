---
sidebar_position: 3
title: Installation
description: Step-by-step installation guide for MCP JetBrains Code Inspections
---

# Installation

## Prerequisites

Before installing MCP JetBrains Code Inspections, ensure you have:

- **Node.js 20+** installed
- **At least one JetBrains IDE** installed:
    - IntelliJ IDEA
    - WebStorm
    - PyCharm
    - PhpStorm
    - GoLand
    - RubyMine
    - CLion
    - DataGrip
    - Rider
- **IDE configured with command-line support**

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/josedacosta/mcp-jetbrains-code-inspections.git
cd mcp-jetbrains-code-inspections
```

### 2. Install Dependencies

```bash
yarn install
# or
npm install
```

### 3. Build the Project

```bash
yarn build
# or
npm run build
```

This will compile TypeScript files to JavaScript in the `dist/` directory.

## MCP Configuration

Add the server to your MCP configuration file.

### For Claude Code

Claude Code requires two configuration files to properly enable the MCP server:

#### 1. Create `.mcp.json` in your project root:

```json
{
    "mcpServers": {
        "mcp-jetbrains-code-inspections": {
            "command": "node",
            "args": ["dist/index.js"],
            "env": {
                "EXCLUDE_INSPECTIONS": "SpellCheckingInspection"
            }
        }
    }
}
```

#### 2. Create `.claude/settings.local.json` in your project root:

```json
{
    "permissions": {
        "allow": [],
        "deny": []
    },
    "enableAllProjectMcpServers": true,
    "enabledMcpjsonServers": ["mcp-jetbrains-code-inspections"]
}
```

:::important
Both files are required for Claude Code to properly load and enable the MCP server. The `.claude/settings.local.json` file explicitly enables the
server defined in `.mcp.json`.
:::

**Notes:**

- If you cloned this repository locally, use relative path `"dist/index.js"`
- For global installation, use absolute path: `"/path/to/mcp-jetbrains-code-inspections/dist/index.js"`
- The example shows excluding spell checking inspections, but you can configure other environment variables as needed
- The `.claude/` directory and its contents are typically added to `.gitignore` as they contain local settings

## Verify Installation

To verify the installation in Claude Code:

1. Open Claude Code:

    ```bash
    claude
    ```

2. Use the `/mcp` command to list available MCP servers:

    ```
    /mcp
    ```

3. You should see `mcp-jetbrains-code-inspections` in the list of configured servers

4. Select it to view available tools - you should see:
    - `get_jetbrains_code_inspections` - Run JetBrains IDE code inspections on files or directories

For more details on MCP configuration in Claude Code, see the [official documentation](https://docs.anthropic.com/en/docs/claude-code/mcp).

## Next Steps

- Continue to [Quick Start](./quick-start) to run your first inspection
- Learn about [Configuration Options](../configuration/) for advanced setup
