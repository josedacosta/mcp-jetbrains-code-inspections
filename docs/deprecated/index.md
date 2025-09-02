---
sidebar_position: 1
title: Deprecated Notice
---

# ⚠️ Deprecated Notice

## This Project is Deprecated

**This project is deprecated but still functional.** Starting from version 2025.2, JetBrains IDEs now include a built-in MCP server that provides native integration with external clients.

## Why This Project is Deprecated

JetBrains has integrated MCP support directly into their IDEs, making this external tool unnecessary for most users. The native integration offers:

- **Better Performance**: Direct IDE integration without command-line overhead
- **More Features**: 25+ tools vs. our single inspection tool
- **Official Support**: Maintained by JetBrains
- **Seamless Integration**: No external dependencies needed

## Migration Resources

- **[Migration to JetBrains Native MCP](./jetbrains-native-mcp)** - Complete migration guide with screenshots
- **[JetBrains MCP Documentation](https://www.jetbrains.com/help/webstorm/mcp-server.html)** - Official documentation
- **[JetBrains MCP Plugin](https://plugins.jetbrains.com/plugin/26071-mcp-server)** - For IDEs before 2025.2

## When to Continue Using This Project

You might still need this project if:

- You're using JetBrains IDEs older than 2025.2
- You need comprehensive project-wide inspections including warnings
- You require command-line only operation without IDE GUI
- You need specific customizations not available in native integration

## Support

This project will continue to work but is no longer actively developed. For new features and improvements, please use the native JetBrains MCP integration.
