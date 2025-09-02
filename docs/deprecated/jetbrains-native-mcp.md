---
sidebar_position: 10
title: JetBrains Native MCP Migration
---

# Migration to JetBrains Native MCP

## Overview

Starting from version 2025.2, JetBrains IDEs (WebStorm, IntelliJ IDEA, PyCharm, etc.) include a built-in MCP (Model Context Protocol) server. This native integration eliminates the need for external tools like this project and provides direct communication between LLM clients and JetBrains IDEs.

## Why Migrate?

The native JetBrains MCP integration offers several advantages:

- **Direct IDE Control**: Control and interact with JetBrains IDEs without leaving your LLM application
- **Comprehensive Tool Set**: Access to 25+ tools covering various development workflows
- **Better Performance**: Native integration provides faster response times
- **Official Support**: Maintained and supported directly by JetBrains
- **No External Dependencies**: No need for separate Node.js processes or external scripts

## Native Integration Details

### Supported JetBrains IDEs (2025.2+)

- WebStorm
- IntelliJ IDEA
- PyCharm
- PhpStorm
- GoLand
- Rider
- CLion
- RubyMine
- DataGrip
- DataSpell
- Android Studio
- RustRover

### Supported External Clients

- Claude Desktop
- Claude Code
- Cursor
- VS Code
- Windsurf
- Other MCP-compatible clients

## Setting Up Native MCP

### For JetBrains IDE 2025.2+

1. **Enable MCP Server in IDE**:
    - Open your JetBrains IDE
    - Navigate to `Settings` → `Tools` → `MCP Server`
    - Click "Enable MCP Server"

![Enable MCP Server in JetBrains IDE Settings](/screen/mcp_01.png)
_First step: Check the "Enable MCP Server" checkbox to activate the native MCP integration_

2. **Configure Your Client**:

    **Automatic Configuration:**
    - In the MCP Server settings, click "Auto-Configure" for your client
    - The IDE will automatically update your client's configuration
    - Restart your client to apply changes

![Auto-configure clients for MCP](/screen/mcp_02.png)
_Auto-configuration: Click "Auto-Configure" for Claude Code or other detected clients. Note the status shows "Configured - restart the client if changes aren't applied"_

**Manual Configuration:**

- Copy the SSE or Stdio configuration from the settings
- Paste into your client's configuration file
- Restart your client

### For Earlier JetBrains Versions

For IDEs before version 2025.2, you can use the [JetBrains MCP plugin](https://plugins.jetbrains.com/plugin/26071-mcp-server):

1. Install the plugin from JetBrains Marketplace
2. Configure the plugin following the documentation on [GitHub](https://github.com/JetBrains/mcp-jetbrains)

## Verifying the Connection in Claude Code

After configuring the MCP server, you can verify the connection directly in Claude Code:

### 1. Check Available MCP Commands

![Claude Code MCP commands](/screen/mcp_03.png)
_Type `/mcp` in Claude Code to see available MCP management commands_

### 2. View Connected MCP Servers

![View connected MCP servers](/screen/mcp_04.png)
_Use `/mcp` → "Manage MCP servers" to see your connected JetBrains server with a green checkmark_

### 3. Inspect Server Details

![JetBrains MCP server details](/screen/mcp_05.png)
_View detailed server information including status, URL, configuration location, and the number of available tools (22 tools in this example)_

### 4. Browse Available Tools

![List of available MCP tools](/screen/mcp_06.png)
_Explore the full list of available tools, including `get_file_problems` and `get_project_problems` highlighted for code inspection_

## Available Tools in Native Integration

The native MCP server provides access to various tool categories:

### Inspection and Error Tools

- **`get_file_problems`**: Analyzes a specific file for errors and warnings
    - Important: Set `errorsOnly: false` for comprehensive results (similar to this project)
    - Default behavior only shows errors

![get_file_problems tool documentation](/screen/mcp_07.png)
_The `get_file_problems` tool documentation showing the critical `errorsOnly` parameter - set it to false to get all warnings, not just errors_

- **`get_project_problems`**: Retrieves project-wide problems
    - Note: Only returns critical errors, not warnings
    - More limited than this project's comprehensive inspection

![get_project_problems tool documentation](/screen/mcp_08.png)
_The `get_project_problems` tool documentation - note it lacks an `errorsOnly` parameter and only returns severe issues_

### Other Tool Categories

- **General**: File search, run configurations
- **Debugging**: Breakpoint management, debug sessions
- **File Management**: Create, read, modify files
- **Formatting**: Code formatting and reformatting
- **Text Manipulation**: Find/replace, refactoring
- **Terminal**: Execute terminal commands
- **Version Control**: Git operations and VCS status

## Migration Comparison

### Inspection Capabilities

| Feature             | This Project        | Native MCP                  |
| ------------------- | ------------------- | --------------------------- |
| File inspections    | ✅ Full inspections | ✅ With `errorsOnly: false` |
| Project inspections | ✅ All severities   | ⚠️ Critical errors only     |
| Custom profiles     | ✅ Supported        | ✅ Uses IDE profiles        |
| Multiple IDEs       | ✅ Auto-detection   | ✅ Per-IDE configuration    |
| Isolation           | ✅ Separate process | ✅ Integrated with IDE      |

### Configuration Differences

**This Project (Environment Variables):**

```json
{
    "env": {
        "EXCLUDE_INSPECTIONS": "SpellCheckingInspection",
        "INSPECTION_TIMEOUT": "120000",
        "RESPONSE_FORMAT": "markdown"
    }
}
```

**Native MCP (Via LLM Prompts):**

Instead of configuring environment variables, you specify requirements directly in your prompts:

```
"Analyze src/app.ts for ALL problems including warnings (not just errors), with a 2-minute timeout"
"Check the file but ignore spelling issues"
"Get all code problems in src/app.ts - make sure errorsOnly is false for comprehensive results"
```

The LLM will translate these instructions into the appropriate tool parameters when calling the native MCP tools.

## Migration Steps

### 1. Backup Current Configuration

Save your current `.mcp.json` configuration for reference:

```bash
cp .mcp.json .mcp.json.backup
```

### 2. Update JetBrains IDE

Ensure your IDE is updated to version 2025.2 or later:

- Check for updates: `Help` → `Check for Updates`
- Download latest version from [JetBrains website](https://www.jetbrains.com/)

### 3. Enable Native MCP

Follow the setup instructions above for your IDE version.

### 4. Update Your Workflow

When working with your LLM (Claude Code, etc.), you'll need to update your prompts to use the new native tools.

#### For File Inspections

**Before (this project):**

```
Check the code quality of the file /src/app.ts using JetBrains inspections
```

**After (native MCP):**

```
Check for all code problems in src/app.ts, including warnings and info messages, not just errors
```

**Important:** Always specify that you want ALL issues (errors, warnings, info) because the native tool defaults to errors only.

#### For Project Inspections

**Before (this project):**

```
Run inspections on my entire /src/ directory
```

**After (native MCP):**

```
Check for critical errors in the entire project using get_project_problems
```

**Note:** The native `get_project_problems` only returns critical errors. For comprehensive analysis, ask the LLM to check individual files or directories using `get_file_problems` instead.

### 5. Test the Migration

1. Run a simple file inspection to verify connectivity
2. Compare results with previous inspections
3. Adjust parameters as needed

## Important Considerations

### Limitations of Native Integration

1. **Project Problems**: The native `get_project_problems` only returns critical errors, not warnings or info-level issues

![Example of get_project_problems output](/screen/mcp_09.png)
_Example output: `get_project_problems` often returns an empty array even when the project has warnings or minor issues - it only reports severe compilation errors_

2. **No Standalone Mode**: Requires the IDE to be running
3. **Per-IDE Configuration**: Each IDE needs separate configuration

### When to Keep Using This Project

You might want to continue using this project if:

- You need comprehensive project-wide inspections including warnings
- You require command-line only operation without IDE GUI
- You're using JetBrains IDEs older than 2025.2
- You need specific customizations not available in native integration

## Troubleshooting

### Common Issues

**IDE not detected by client:**

- Ensure MCP Server is enabled in IDE settings
- Check that the IDE is running
- Verify client configuration is correct
- Restart both IDE and client

**Missing inspections:**

- For `get_file_problems`, ensure `errorsOnly: false`
- Check IDE inspection profiles are properly configured
- Verify file is within project scope

**Performance issues:**

- Adjust timeout values in tool parameters
- Ensure IDE indexing is complete
- Check system resources

## Support and Resources

### Official Documentation

- [WebStorm MCP Server Guide](https://www.jetbrains.com/help/webstorm/mcp-server.html)
- [JetBrains MCP Plugin](https://plugins.jetbrains.com/plugin/26071-mcp-server)
- [GitHub Repository](https://github.com/JetBrains/mcp-jetbrains)

### Community Resources

- [JetBrains Support](https://www.jetbrains.com/support/)
- [Model Context Protocol Documentation](https://modelcontextprotocol.io)

## Conclusion

The native JetBrains MCP integration represents the future of IDE-LLM communication. While this project remains functional, we recommend migrating to the native solution for the best experience and ongoing support. The migration process is straightforward, and the benefits include better performance, more features, and official support from JetBrains.

For any migration issues or if you need features not available in the native integration, this project will continue to work as an alternative solution.
