---
sidebar_position: 5
title: MCP Features
description: Complete guide to using prompts and resources in the MCP server
---

# MCP Features Guide

This guide covers the advanced MCP features: **Prompts** and **Resources** that enhance the inspection server capabilities.

## Overview

Beyond the main inspection tool, the server provides:
- **3 Prompts**: Pre-configured interaction patterns for common tasks
- **3 Resources**: Runtime information about the server state

## Prompts

Prompts provide pre-configured messages for common inspection workflows.

### analyze-project

Analyze an entire project for code quality issues.

#### Parameters
- `projectPath` (required): Path to the project root
- `profile` (optional): Inspection profile name (Default, Strict, etc.)

#### Example Usage

```javascript
// Using Claude or another MCP client
const result = await client.getPrompt({
    name: 'analyze-project',
    arguments: {
        projectPath: '/Users/dev/my-project',
        profile: 'Strict'
    }
});

// The prompt generates:
// "Please analyze the project at /Users/dev/my-project using JetBrains 
//  inspections with profile 'Strict'."
```

#### Use Cases
- CI/CD pipeline integration
- Pre-commit quality checks
- Full project audits
- Migration validation

### check-file

Quick inspection of a single file.

#### Parameters
- `filePath` (required): Path to the file to inspect

#### Example Usage

```javascript
const result = await client.getPrompt({
    name: 'check-file',
    arguments: {
        filePath: 'src/components/UserProfile.tsx'
    }
});

// The prompt generates:
// "Check the file at src/components/UserProfile.tsx for code quality 
//  issues using JetBrains inspections."
```

#### Use Cases
- Pre-save validation in editors
- Pull request file validation
- Quick spot checks
- Real-time feedback during development

### fix-issues

Get actionable fix suggestions for detected issues.

#### Parameters
- `projectPath` (required): Path to the project
- `severity` (optional): Minimum severity filter (ERROR, WARNING, INFO)

#### Example Usage

```javascript
const result = await client.getPrompt({
    name: 'fix-issues',
    arguments: {
        projectPath: '/Users/dev/my-project',
        severity: 'ERROR'
    }
});

// The prompt generates:
// "Analyze the project at /Users/dev/my-project and provide fix 
//  suggestions for issues with severity ERROR or higher."
```

#### Use Cases
- Automated fix suggestions
- Code review assistance
- Technical debt prioritization
- Learning tool for best practices

## Resources

Resources provide runtime information about the server configuration and environment.

### inspection://profiles

Lists all available inspection profiles.

#### Response Format

```json
{
    "profiles": [
        "Default",
        "Project Default", 
        "Strict",
        "Essential"
    ],
    "description": "Available inspection profiles for code analysis"
}
```

#### Example Usage

```javascript
// List available profiles
const profilesResource = await client.readResource({
    uri: 'inspection://profiles'
});

const profiles = JSON.parse(profilesResource.contents[0].text);
console.log('Available profiles:', profiles.profiles);

// Use in automation
for (const profile of profiles.profiles) {
    await runInspectionWithProfile(profile);
}
```

#### Use Cases
- Dynamic profile selection in UIs
- Profile availability validation
- Documentation generation
- Configuration discovery

### inspection://config

Returns the current server configuration.

#### Response Format

```json
{
    "name": "mcp-jetbrains-code-inspections",
    "version": "1.0.0",
    "defaultTimeout": 120000,
    "responseFormat": "markdown",
    "excludedInspections": ["SpellCheckingInspection"],
    "includedInspections": [],
    "debug": false,
    "logLevel": "INFO"
}
```

#### Example Usage

```javascript
// Check current configuration
const configResource = await client.readResource({
    uri: 'inspection://config'
});

const config = JSON.parse(configResource.contents[0].text);

// Validate timeout settings
if (config.defaultTimeout < 60000) {
    console.warn('Timeout might be too short for large projects');
}

// Check excluded inspections
console.log('Excluded:', config.excludedInspections);
```

#### Use Cases
- Configuration validation
- Dynamic adjustment recommendations
- Debugging and troubleshooting
- Environment verification

### inspection://ides

Lists all detected JetBrains IDEs on the system.

#### Response Format

```json
{
    "detected": [
        {
            "name": "WebStorm",
            "type": "webstorm",
            "version": "2024.1",
            "inspectPath": "/Applications/WebStorm.app/Contents/bin/inspect.sh",
            "score": 150
        },
        {
            "name": "IntelliJ IDEA",
            "type": "idea",
            "version": "2024.1", 
            "inspectPath": "/Applications/IntelliJ IDEA.app/Contents/bin/inspect.sh",
            "score": 200
        }
    ],
    "count": 2
}
```

#### Example Usage

```javascript
// Check available IDEs
const idesResource = await client.readResource({
    uri: 'inspection://ides'
});

const ides = JSON.parse(idesResource.contents[0].text);

// Verify IDE availability
if (ides.count === 0) {
    throw new Error('No JetBrains IDE found. Please install one.');
}

// Select best IDE for project
const bestIDE = ides.detected.reduce((best, current) => 
    current.score > best.score ? current : best
);

console.log(`Using ${bestIDE.name} v${bestIDE.version}`);
```

#### Use Cases
- IDE availability verification
- Version compatibility checks
- Installation validation
- Troubleshooting IDE detection issues

## Integration Examples

### Complete Workflow Example

```javascript
async function completeInspectionWorkflow(projectPath) {
    // 1. Check IDE availability
    const idesResource = await client.readResource({
        uri: 'inspection://ides'
    });
    const ides = JSON.parse(idesResource.contents[0].text);
    
    if (ides.count === 0) {
        throw new Error('No JetBrains IDE available');
    }
    
    // 2. Get available profiles
    const profilesResource = await client.readResource({
        uri: 'inspection://profiles'
    });
    const profiles = JSON.parse(profilesResource.contents[0].text);
    
    // 3. Use analyze-project prompt
    const prompt = await client.getPrompt({
        name: 'analyze-project',
        arguments: {
            projectPath: projectPath,
            profile: profiles.profiles[0] // Use first available
        }
    });
    
    // 4. Execute inspection
    const result = await client.callTool({
        name: 'get_jetbrains_code_inspections',
        arguments: { path: projectPath }
    });
    
    // 5. Get fix suggestions for errors
    if (result.totalProblems > 0) {
        const fixPrompt = await client.getPrompt({
            name: 'fix-issues',
            arguments: {
                projectPath: projectPath,
                severity: 'ERROR'
            }
        });
        // Process fix suggestions...
    }
    
    return result;
}
```

### CI/CD Integration

```javascript
async function ciQualityGate() {
    // Verify environment
    const config = await client.readResource({
        uri: 'inspection://config'
    });
    
    const configData = JSON.parse(config.contents[0].text);
    
    // Ensure appropriate timeout for CI
    if (configData.defaultTimeout < 300000) {
        console.warn('Consider increasing timeout for CI environment');
    }
    
    // Run full project analysis
    const prompt = await client.getPrompt({
        name: 'analyze-project',
        arguments: {
            projectPath: process.env.CI_PROJECT_DIR,
            profile: 'Strict'
        }
    });
    
    // Execute and validate
    const result = await executeInspection(prompt);
    
    if (result.errors > 0) {
        process.exit(1); // Fail the build
    }
}
```

## Best Practices

### 1. Resource Checking

Always verify resources before operations:

```javascript
// Good practice
const ides = await checkIDEAvailability();
const profiles = await getAvailableProfiles();
const config = await validateConfiguration();

// Then proceed with inspection
await runInspection();
```

### 2. Prompt Selection

Choose the right prompt for your use case:

- **analyze-project**: Full analysis, CI/CD pipelines
- **check-file**: Editor integrations, quick checks
- **fix-issues**: Code review, learning, refactoring

### 3. Error Handling

```javascript
try {
    const resource = await client.readResource({
        uri: 'inspection://ides'
    });
    // Process resource...
} catch (error) {
    if (error.code === 'RESOURCE_NOT_FOUND') {
        // Handle missing resource
    }
    // Handle other errors...
}
```

### 4. Caching Resources

Resources are relatively static, consider caching:

```javascript
class InspectionClient {
    constructor() {
        this.cache = new Map();
    }
    
    async getCachedResource(uri, ttl = 60000) {
        const cached = this.cache.get(uri);
        if (cached && Date.now() - cached.time < ttl) {
            return cached.data;
        }
        
        const data = await client.readResource({ uri });
        this.cache.set(uri, { data, time: Date.now() });
        return data;
    }
}
```

## Troubleshooting

### Common Issues

#### No Prompts Available

```javascript
// Check server capabilities
const capabilities = await client.getServerCapabilities();
if (!capabilities.prompts) {
    console.error('Server does not support prompts');
}
```

#### Resource Access Errors

```javascript
// Validate resource URI
const validResources = [
    'inspection://profiles',
    'inspection://config', 
    'inspection://ides'
];

if (!validResources.includes(resourceUri)) {
    throw new Error(`Invalid resource URI: ${resourceUri}`);
}
```

#### Empty IDE List

```javascript
const ides = await client.readResource({
    uri: 'inspection://ides'
});

if (JSON.parse(ides.contents[0].text).count === 0) {
    console.log('Troubleshooting steps:');
    console.log('1. Verify JetBrains IDE is installed');
    console.log('2. Check installation path is standard');
    console.log('3. Set FORCE_INSPECT_PATH if using custom location');
}
```

## See Also

- [API Reference](./api-reference) - Complete API documentation
- [Basic Usage](./basic-usage) - Getting started guide
- [Advanced Usage](./advanced-usage) - Complex scenarios
- [Configuration](../configuration/) - Server configuration options