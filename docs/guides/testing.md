---
sidebar_position: 3
title: Testing
description: How to test your MCP server setup and troubleshoot issues
---

# Testing Guide

This guide covers testing the MCP JetBrains Code Inspections server and its functionality.

## Overview

The project provides multiple ways to test the server functionality. The main testing approaches include MCP Inspector and interactive scripts.

## Testing Methods

### 1. MCP Inspector (Recommended)

The MCP Inspector provides an interactive web interface to test the server:

```bash
# Test with built server
yarn inspect

# Test with development server
yarn inspect:dev

# Test with auto-rebuilding
yarn inspect:watch

# Direct inspector command
npx @modelcontextprotocol/inspector node dist/index.js
```

### 2. Interactive Test Script

```bash
# Run interactive MCP test
yarn test:mcp
```

### 3. Development Mode

```bash
# Run server in development mode
yarn dev

# Run built server
yarn start
```

## Running Tests

### Available Test Scripts

- `yarn test:mcp` - Interactive MCP server testing
- `yarn inspect` - Launch MCP Inspector
- `yarn check:ide` - Check IDE availability

## Testing the MCP Tool

### Using MCP Inspector

1. Start the MCP Inspector:

    ```bash
    yarn inspect
    ```

2. In the web interface:
    - Select the `get_jetbrains_code_inspections` tool
    - Enter a path parameter (file or directory)
    - Click "Call Tool"
    - Review the inspection results

### Example Tool Calls

```javascript
// Test with a single file
{
  "path": "/Users/yourname/project/src/index.ts"
}

// Test with a directory
{
  "path": "/Users/yourname/project/src"
}

// Test with current directory
{
  "path": "."
}
```

### Environment Variable Testing

Test different configurations:

```bash
# Test with specific IDE
FORCE_INSPECT_PATH="/Applications/IntelliJ IDEA CE.app/Contents/bin/inspect.sh" yarn inspect

# Test with timeout
INSPECTION_TIMEOUT=300000 yarn inspect

# Test with debug logging
DEBUG=true yarn inspect

# Test with inspection filtering
EXCLUDE_INSPECTIONS="SpellCheckingInspection,GrazieInspection" yarn inspect
```

### Testing Different Response Formats

```bash
# Test markdown output (default)
RESPONSE_FORMAT=markdown yarn inspect

# Test JSON output
RESPONSE_FORMAT=json yarn inspect
```

## Verification Steps

### 1. Verify IDE Availability

To check which JetBrains IDEs are available on your system, enable debug mode:

```bash
DEBUG=true yarn test:mcp --path ./src/index.ts
```

The debug output will show:

- Which JetBrains IDEs are detected
- IDE priority order for automatic selection
- Selected IDE for inspection

**Note**: All detected IDEs can be used for inspections thanks to isolated configuration, regardless of whether they're already running.

### 2. Test Basic Functionality

1. Create a test file with some issues:

    ```typescript
    // test.ts
    const unused = 'this variable is unused';
    console.log('Hello world');
    ```

2. Test with MCP Inspector:

    ```bash
    yarn inspect
    ```

3. Call the tool with the test file path
4. Verify you get inspection results

### 3. Test Error Handling

- Test with non-existent path
- Test with invalid parameters
- Test with no available IDEs

## Troubleshooting Tests

### Common Issues

1. **"No JetBrains IDE found"**
    - Enable debug mode to see IDE detection: `DEBUG=true yarn test:mcp`
    - Install IntelliJ IDEA Community Edition (free)
    - Set `FORCE_INSPECT_PATH` if IDE is installed in non-standard location

2. **Timeout errors**
    - Increase timeout: `INSPECTION_TIMEOUT=300000 yarn inspect`
    - Test with smaller files/directories first

3. **Permission errors**
    - Check file permissions on IDE inspect scripts
    - Ensure temp directory is writable

4. **Empty results**
    - Ensure the file has actual issues to detect
    - Check if inspection profile is properly configured
    - Try with debug logging: `DEBUG=true yarn inspect`

## Advanced Testing

### Custom IDE Testing

```bash
# Test with specific IDE
FORCE_INSPECT_PATH="/Applications/PyCharm.app/Contents/bin/inspect.sh" yarn test:mcp

# Test with custom project root
FORCE_PROJECT_ROOT="/path/to/project" yarn test:mcp

# Test with custom profile
FORCE_PROFILE_PATH="/path/to/profile.xml" yarn test:mcp
```

### Performance Testing

```bash
# Test with large timeout
INSPECTION_TIMEOUT=600000 yarn inspect

# Test specific inspections only
ONLY_INSPECTIONS="JSUnusedLocalSymbols,JSUnusedGlobalSymbols" yarn inspect
```

## Quality Assurance

### Code Quality Checks

```bash
# Run all quality checks
yarn check

# Individual checks
yarn prettier:check    # Code formatting
yarn eslint:check     # Code linting
yarn typescript:check # Type checking
```

## Integration Testing

For integration testing, use the MCP Inspector or interactive test script to verify:

1. Tool registration and discovery
2. Parameter validation
3. IDE detection and selection
4. Inspection execution
5. Result formatting and return
6. Error handling and reporting

This provides comprehensive testing of the entire MCP server workflow.
