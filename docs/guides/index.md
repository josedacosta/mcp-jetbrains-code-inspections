---
sidebar_position: 1
title: Guides
description: Practical guides and tutorials for common tasks and scenarios
---

# Guides

Practical guides and tutorials for common tasks and advanced usage of MCP JetBrains Code Inspections.

## Available Guides

### [Multi-IDE Usage](./multi-ide-usage)

Learn how to use the server across different JetBrains IDEs:

- Automatic IDE detection
- IDE priority system
- Language-specific configurations
- Switching between IDEs

### [Troubleshooting](./troubleshooting)

Solutions for common issues:

- Timeout problems
- IDE not found errors
- Profile configuration issues
- Performance optimization

### [Testing](./testing)

How to test your setup and verify functionality:

- MCP Inspector usage
- Manual testing methods
- Debugging techniques
- Validation approaches

### [Best Practices](./best-practices)

Proven patterns for production use:

- Performance optimization
- Configuration management
- Error handling strategies
- Team workflows

## Quick Tips

### Performance Optimization

```javascript
// For large projects, increase timeout
{
  "env": {
    "INSPECTION_TIMEOUT": "600000" // 10 minutes
  }
}
```

### IDE Selection

```bash
# Force specific IDE
export FORCE_INSPECT_PATH="/Applications/IntelliJ.app/Contents/bin/inspect.sh"
```

### Debug Mode

```javascript
// Enable debug logging via environment variable
{
  "env": {
    "DEBUG": "true"
  }
}

// Call the tool
await get_jetbrains_code_inspections({
  path: '/path/to/file'
});
```

## Common Scenarios

### Testing the MCP Server

Quick ways to test the server:

```bash
# Using MCP Inspector
yarn inspect

# Using the interactive test script
yarn test:mcp

# Direct testing
npx @modelcontextprotocol/inspector node dist/index.js
```

### Analyzing a Full Project

```javascript
// Analyze entire project directory
await get_jetbrains_code_inspections({
    path: '/path/to/project',
});

// Analyze specific file
await get_jetbrains_code_inspections({
    path: '/path/to/project/src/file.ts',
});
```

### CI/CD Integration

Using inspections in continuous integration:

```bash
# Set timeout for large projects
export INSPECTION_TIMEOUT=600000  # 10 minutes

# Force specific IDE path
export FORCE_INSPECT_PATH="/usr/local/idea/bin/inspect.sh"

# Run inspection
node dist/index.js
```

## Contributing Guides

Have a useful guide or workflow? Consider contributing:

1. Fork the repository
2. Add your guide to this section
3. Submit a pull request

## Need Help?

- Check [Troubleshooting](./troubleshooting) first
- Review [Technical Documentation](../technical/)
- Open an [issue on GitHub](https://github.com/josedacosta/mcp-jetbrains-code-inspections/issues)
