---
sidebar_position: 1
title: Technical
description: Technical documentation and system architecture details
---

# Technical Documentation

Deep dive into the technical aspects of MCP JetBrains Code Inspections.

## Technical Topics

### [Architecture](./architecture)

Comprehensive overview of the system architecture:

- MCP server implementation
- IDE integration mechanisms
- Data flow and processing
- Component interactions

### [Shared Inspection Engine](./shared-inspection-engine)

Understanding JetBrains' unified inspection system:

- How inspections work across IDEs
- Language-agnostic architecture
- Inspection execution pipeline
- Result processing

### [IDE Inspection Equivalence](./ide-inspection-equivalence)

Cross-IDE compatibility details:

- Inspection parity between IDEs
- Language-specific considerations
- Profile compatibility
- Result normalization

### [Inspection Consistency](./inspection-consistency)

Ensuring consistent results:

- Deterministic analysis
- Configuration management
- Version compatibility
- Result stability

## Key Technical Concepts

### MCP Protocol Integration

The server provides a single tool with one required parameter:

```typescript
// Server implements MCP tool interface
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: 'get_jetbrains_code_inspections',
            description: 'Run JetBrains IDE code inspections on files or directories',
            inputSchema: {
                type: 'object',
                properties: {
                    path: {
                        type: 'string',
                        description: 'File or directory path to inspect',
                    },
                },
                required: ['path'],
            },
        },
    ],
}));
```

**Tool Configuration**: All configuration is done via environment variables, not tool parameters:

- `FORCE_INSPECT_PATH`: Force specific IDE inspect tool path
- `FORCE_PROJECT_ROOT`: Force project root directory
- `FORCE_PROFILE_PATH`: Force inspection profile path
- `INSPECTION_TIMEOUT`: Timeout in milliseconds
- `EXCLUDE_INSPECTIONS`: Comma-separated inspection codes to exclude
- `ONLY_INSPECTIONS`: Comma-separated inspection codes to include only
- `RESPONSE_FORMAT`: Output format ('markdown' or 'json')
- `DEBUG`: Enable debug logging

### IDE Detection Algorithm

```typescript
// Automatic IDE selection based on availability
const ideHierarchy = ['IntelliJ IDEA', 'WebStorm', 'PyCharm', 'PhpStorm', 'GoLand'];
```

### Diagnostic Mapping

```typescript
// JetBrains severity to LSP diagnostic severity
const severityMap = {
    ERROR: DiagnosticSeverity.Error,
    WARNING: DiagnosticSeverity.Warning,
    'WEAK WARNING': DiagnosticSeverity.Information,
    INFO: DiagnosticSeverity.Hint,
};
```

## Implementation Details

### Process Management

- Subprocess spawning for IDE tools
- Timeout handling
- Error recovery
- Resource cleanup

### Data Processing

- JSON parsing and validation
- Path resolution
- URI handling
- Result transformation

### Performance Considerations

- Lazy IDE detection
- Result caching potential
- Parallel processing capabilities
- Memory management

## Advanced Topics

### Custom Tool Integration

Extending the server with additional tools

### Multi-Project Support

Handling multiple projects simultaneously

### Remote Inspection

Running inspections on remote codebases

### API Extensions

Extending the MCP protocol for custom needs

## Contributing

Technical contributions welcome:

- Performance improvements
- Additional IDE support
- Enhanced error handling
- Protocol extensions

## References

- [MCP Specification](https://modelcontextprotocol.io)
- [JetBrains Platform SDK](https://plugins.jetbrains.com/docs/intellij/welcome.html)
- [Language Server Protocol](https://microsoft.github.io/language-server-protocol/)
