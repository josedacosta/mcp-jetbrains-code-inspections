---
sidebar_position: 4
title: Troubleshooting
description: Solutions for common issues and error messages
---

# Troubleshooting

Solutions for common issues when using MCP JetBrains Code Inspections.

## Common Issues

### IDE Not Found

**Error**: "No JetBrains IDE found" or "Cannot find inspect tool"

**Solutions**:

1. Verify IDE is installed:

    ```bash
    ls /Applications/ | grep -E "(IntelliJ|WebStorm|PyCharm)"
    ```

2. Set explicit IDE path:

    ```bash
    export FORCE_INSPECT_PATH="/path/to/your/IDE.app/Contents/bin/inspect.sh"
    ```

3. Check IDE process isn't blocking:
    ```bash
    ps aux | grep -i "intellij\|webstorm\|pycharm"
    ```

### Timeout Errors

**Error**: "Timeout getting diagnostics" or inspection takes too long

**Solutions**:

1. Increase timeout value:

    ```json
    {
        "env": {
            "INSPECTION_TIMEOUT": "600000" // 10 minutes
        }
    }
    ```

2. Analyze smaller scopes:

    ```javascript
    // Instead of entire project
    await get_jetbrains_code_inspections({
        path: '/src/specific/file.ts',
    });
    ```

3. Enable debug mode for more information:
    ```json
    {
        "env": {
            "DEBUG": "true"
        }
    }
    ```

### No Diagnostics Returned

**Error**: Empty diagnostics array despite known issues

**Solutions**:

1. Check inspection profile exists:

    ```bash
    ls .idea/inspectionProfiles/
    ```

2. Verify file is in project:

    ```bash
    # File should be within project root
    realpath --relative-to=. /path/to/file
    ```

3. Test with MCP Inspector:
    ```bash
    yarn inspect
    # Then test with the file path in the web interface
    ```

### Permission Denied

**Error**: "Permission denied" when running inspections

**Solutions**:

1. Check file permissions:

    ```bash
    ls -la /path/to/inspect.sh
    chmod +x /path/to/inspect.sh
    ```

2. Verify temp directory access:

    ```bash
    touch /tmp/test-mcp-inspection
    ```

3. Run with correct user:
    ```bash
    whoami
    ls -la .idea/
    ```

### Profile Not Found

**Error**: "Inspection profile not found"

**Solutions**:

1. Create default profile:
    - Open project in JetBrains IDE
    - Go to Settings → Editor → Inspections
    - Save profile as "Project Default"

2. Use unified profile:

    ```bash
    cp src/resources/profiles/unified.xml .idea/inspectionProfiles/
    ```

3. Check profile settings:
    ```xml
    <!-- .idea/inspectionProfiles/profiles_settings.xml -->
    <component name="InspectionProjectProfileManager">
      <settings>
        <option name="USE_PROJECT_PROFILE" value="true" />
      </settings>
    </component>
    ```

## Performance Issues

### Slow Analysis

**Optimize performance**:

1. Exclude unnecessary files:

    ```javascript
    // Focus on source files only
    await get_jetbrains_code_inspections({
        path: '/project/src',
    });
    ```

2. Use specific file types:
    - Configure IDE to skip certain file types
    - Use `.idea/fileTypes.xml` for exclusions

3. Disable expensive inspections:
    - Edit inspection profile
    - Disable data flow analysis for large files

### Memory Issues

**For large projects**:

1. Increase IDE memory:

    ```bash
    # In IDE's vmoptions file
    -Xmx4096m
    -XX:MaxPermSize=1024m
    ```

2. Process files in batches
3. Clear IDE caches if needed

## Debugging

### Enable Debug Logging

1. Set debug environment:

    ```bash
    export DEBUG=true
    ```

2. Check server logs:

    ```bash
    DEBUG=true yarn dev 2>&1 | tee debug.log
    ```

3. Use interactive testing:
    ```bash
    yarn test:mcp
    ```

### Using MCP Inspector

```bash
yarn inspect
# or
npx @modelcontextprotocol/inspector node dist/index.js
```

In the inspector:

1. Select `get_jetbrains_code_inspections` tool
2. Enter path parameter with test file
3. Check request/response details
4. Review any error messages

## Platform-Specific Issues

### macOS

- Check Gatekeeper permissions
- Verify app is in Applications folder
- Look for quarantine attributes

### Windows

- Use forward slashes in paths
- Check Windows Defender exclusions
- Verify PATH environment variable

### Linux

- Install IDE from official source
- Check desktop file associations
- Verify Java runtime version

## Getting Further Help

If issues persist:

1. Collect debug information:
    - IDE version
    - Node.js version
    - Error messages
    - Debug logs

2. Check existing issues:
    - [GitHub Issues](https://github.com/josedacosta/mcp-jetbrains-code-inspections/issues)

3. Create detailed bug report:
    - Steps to reproduce
    - Expected vs actual behavior
    - Environment details
