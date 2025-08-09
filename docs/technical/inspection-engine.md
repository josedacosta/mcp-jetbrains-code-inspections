---
sidebar_position: 4
title: Inspection Engine
description: Technical details of the JetBrains inspection engine integration
---

# Inspection Engine Integration

This document provides technical details about how MCP JetBrains Code Inspections integrates with the JetBrains inspection engine and processes
inspection results.

## JetBrains Inspection Engine Overview

### Shared Inspection Engine

All JetBrains IDEs share a common inspection engine, which means:

- **Cross-IDE Compatibility**: Inspections from IntelliJ IDEA work in WebStorm, PyCharm, etc.
- **Consistent Results**: Same code produces same inspection results regardless of IDE
- **Unified Profiles**: Inspection profiles can be shared across different IDEs
- **Language Support**: Each IDE adds language-specific inspections to the core engine

### Command Line Interface

JetBrains IDEs provide a command-line inspection tool:

#### Unix-like Systems (macOS, Linux)

```bash
inspect.sh <project_path> <inspection_profile> <output_directory> [options]
```

#### Windows

```cmd
inspect.bat <project_path> <inspection_profile> <output_directory> [options]
```

## Integration Architecture

### 1. Command Execution

The MCP server executes JetBrains inspect tool with carefully configured parameters:

```typescript
interface InspectionCommand {
    executable: string; // Path to inspect.sh/inspect.bat
    projectPath: string; // Project or file to analyze
    profilePath: string; // Inspection profile to use
    outputPath: string; // Where to write results
    options: InspectionOptions; // Additional configuration
}
```

### 2. Isolation Configuration

To prevent conflicts with running IDE instances:

```bash
inspect.sh \
  -Didea.config.path="/tmp/mcp-config-${randomId}" \
  -Didea.system.path="/tmp/mcp-system-${randomId}" \
  -Didea.plugins.path="/tmp/mcp-plugins-${randomId}" \
  "${projectPath}" \
  "${profilePath}" \
  "${outputPath}" \
  -format json \
  -d "${targetPath}"
```

#### JVM Properties Explained

- **`idea.config.path`**: Isolated configuration directory (settings, profiles)
- **`idea.system.path`**: Isolated system directory (caches, indices)
- **`idea.plugins.path`**: Isolated plugins directory (prevents plugin conflicts)

### 3. Parameter Configuration

#### Required Parameters (Always Present)

1. **Project Path**: Root directory containing `.idea` folder
2. **Profile Path**: XML file defining which inspections to run
3. **Output Path**: Directory where results will be written

#### Optional Parameters

| Parameter           | Description                         | Default        |
| ------------------- | ----------------------------------- | -------------- |
| `-format`           | Output format (xml, json, plain)    | xml            |
| `-d`                | Target directory or file to analyze | Entire project |
| `-scope`            | Analysis scope name                 | Project Files  |
| `-v0`, `-v1`, `-v2` | Verbosity levels                    | v1             |

### 4. Profile Management

#### Profile Configuration

The system handles profiles as follows:

1. **Forced Profile**: `FORCE_PROFILE_PATH` environment variable provides explicit profile path
2. **Project Defaults**: When no profile is specified, uses `-e` flag for project default inspections
3. **No Automatic Detection**: The system no longer performs automatic profile detection based on file extensions

#### Profile Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<component name="InspectionProjectProfileManager">
  <profile version="1.0">
    <option name="myName" value="Project Default" />

    <!-- Enable specific inspection -->
    <inspection_tool class="UnusedDeclaration"
                     enabled="true"
                     level="WARNING"
                     enabled_by_default="true" />

    <!-- Disable noisy inspection -->
    <inspection_tool class="SpellCheckingInspection"
                     enabled="false"
                     level="INFO"
                     enabled_by_default="false" />

    <!-- Configure severity -->
    <inspection_tool class="NullPointerException"
                     enabled="true"
                     level="ERROR"
                     enabled_by_default="true" />
  </profile>
</component>
```

## Output Processing

### 1. Output Format Selection

#### JSON Format (Preferred)

- Structured data with precise location information
- Machine-readable for programmatic processing
- Includes severity, inspection codes, and descriptions

#### XML Format (Legacy)

- More detailed but harder to parse
- Contains additional metadata
- Used when JSON is not available

#### Plain Text Format

- Human-readable but limited structure
- Fallback when other formats fail
- Minimal parsing required

### 2. JSON Output Structure

```json
{
    "version": "2023.3",
    "problems": [
        {
            "file": "src/components/Button.tsx",
            "line": 15,
            "column": 7,
            "package": "",
            "entry_point": "...",
            "problem_class": {
                "severity": "WARNING",
                "attribute_key": "WARNING_ATTRIBUTES",
                "id": "UnusedDeclaration",
                "name": "Unused declaration",
                "description": "Reports unused functions, variables, and other declarations"
            },
            "hints": [],
            "description": "Function 'handleClick' is never used"
        }
    ]
}
```

### 3. Result Parsing Pipeline

#### Stage 1: Raw Output Validation

```typescript
interface RawInspectionOutput {
    stdout: string;
    stderr: string;
    exitCode: number;
    outputFiles: string[];
}

function validateRawOutput(output: RawInspectionOutput): void {
    if (output.exitCode !== 0 && output.exitCode !== 1) {
        throw new InspectionError(`Inspection failed with exit code ${output.exitCode}`);
    }

    if (output.outputFiles.length === 0) {
        throw new InspectionError('No output files generated');
    }
}
```

#### Stage 2: Format Detection and Parsing

```typescript
function parseInspectionResults(outputPath: string): Diagnostic[] {
    const files = fs.readdirSync(outputPath);

    // Prefer JSON format
    const jsonFile = files.find((f) => f.endsWith('.json'));
    if (jsonFile) {
        return parseJSONResults(path.join(outputPath, jsonFile));
    }

    // Fallback to XML
    const xmlFile = files.find((f) => f.endsWith('.xml'));
    if (xmlFile) {
        return parseXMLResults(path.join(outputPath, xmlFile));
    }

    // Last resort: plain text
    const txtFile = files.find((f) => f.endsWith('.txt'));
    if (txtFile) {
        return parseTextResults(path.join(outputPath, txtFile));
    }

    throw new Error('No parseable output files found');
}
```

#### Stage 3: Diagnostic Normalization

```typescript
interface RawJetBrainsDiagnostic {
    file: string;
    line: number;
    column?: number;
    problem_class: {
        severity: string;
        id: string;
        name: string;
        description?: string;
    };
    description: string;
}

interface NormalizedDiagnostic {
    file: string;
    line: number;
    column: number;
    severity: 'ERROR' | 'WARNING' | 'WEAK WARNING' | 'INFO';
    message: string;
    inspection: string;
    description?: string;
}

function normalizeDiagnostic(raw: RawJetBrainsDiagnostic): NormalizedDiagnostic {
    return {
        file: path.relative(projectRoot, raw.file),
        line: raw.line,
        column: raw.column || 1,
        severity: normalizeSeverity(raw.problem_class.severity),
        message: raw.description,
        inspection: raw.problem_class.id,
        description: raw.problem_class.description,
    };
}
```

## Filtering and Processing

### 1. Inspection Filtering

#### Inclusion/Exclusion Logic

```typescript
function filterDiagnostics(diagnostics: Diagnostic[], options: FilterOptions): Diagnostic[] {
    let filtered = diagnostics;

    // Apply inclusion filter (whitelist)
    if (options.onlyInspections && options.onlyInspections.length > 0) {
        filtered = filtered.filter((d) => options.onlyInspections!.includes(d.inspection));
    }

    // Apply exclusion filter (blacklist)
    if (options.excludeInspections && options.excludeInspections.length > 0) {
        filtered = filtered.filter((d) => !options.excludeInspections!.includes(d.inspection));
    }

    return filtered;
}
```

#### Dynamic Profile Generation

Instead of modifying XML profiles, filters are applied post-processing:

```typescript
function createFilteredProfile(baseProfile: string, includeOnly?: string[], exclude?: string[]): string {
    if (!includeOnly && !exclude) {
        return baseProfile; // Use original profile
    }

    // Generate dynamic profile with filtering
    const profile = parseProfile(baseProfile);

    if (includeOnly) {
        // Disable all inspections except included ones
        profile.inspections.forEach((inspection) => {
            inspection.enabled = includeOnly.includes(inspection.class);
        });
    }

    if (exclude) {
        // Disable excluded inspections
        exclude.forEach((inspectionClass) => {
            const inspection = profile.inspections.find((i) => i.class === inspectionClass);
            if (inspection) {
                inspection.enabled = false;
            }
        });
    }

    return serializeProfile(profile);
}
```

### 2. Severity Mapping

Map JetBrains severity levels to standardized levels:

```typescript
function normalizeSeverity(jetBrainsSeverity: string): SeverityLevel {
    const mapping: Record<string, SeverityLevel> = {
        ERROR: 'ERROR',
        WARNING: 'WARNING',
        WEAK_WARNING: 'WEAK WARNING',
        INFO: 'INFO',
        SERVER_PROBLEM: 'ERROR',
        INFORMATION: 'INFO',
    };

    return mapping[jetBrainsSeverity] || 'INFO';
}
```

## Error Handling and Recovery

### 1. Common Error Scenarios

#### IDE Not Found

```typescript
class IDENotFoundError extends Error {
    constructor() {
        super('No suitable JetBrains IDE found');
        this.name = 'IDENotFoundError';
    }
}
```

#### Inspection Timeout

```typescript
class InspectionTimeoutError extends Error {
    constructor(timeout: number) {
        super(`Inspection timed out after ${timeout}ms`);
        this.name = 'InspectionTimeoutError';
    }
}
```

#### Invalid Project Structure

```typescript
class InvalidProjectError extends Error {
    constructor(path: string) {
        super(`Invalid project structure at ${path}: missing .idea directory`);
        this.name = 'InvalidProjectError';
    }
}
```

### 2. Recovery Strategies

#### Automatic Retry with Fallback

```typescript
async function executeInspectionWithFallback(command: InspectionCommand, maxRetries: number = 2): Promise<Diagnostic[]> {
    const strategies = [() => executeWithJSON(command), () => executeWithXML(command), () => executeWithPlainText(command)];

    for (const strategy of strategies) {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await strategy();
            } catch (error) {
                if (attempt === maxRetries) {
                    console.warn(`Strategy failed after ${maxRetries + 1} attempts:`, error);
                } else {
                    console.warn(`Attempt ${attempt + 1} failed, retrying...`, error);
                    await delay(1000 * (attempt + 1)); // Exponential backoff
                }
            }
        }
    }

    throw new Error('All inspection strategies failed');
}
```

#### Graceful Degradation

```typescript
async function executeWithGracefulDegradation(command: InspectionCommand): Promise<InspectionResult> {
    try {
        return await executeInspection(command);
    } catch (error) {
        if (error instanceof InspectionTimeoutError) {
            return {
                diagnostics: [],
                totalProblems: 0,
                timeout: true,
                warning: `Inspection timed out. Try analyzing a smaller scope.`,
            };
        }

        if (error instanceof InvalidProjectError) {
            return {
                diagnostics: [],
                totalProblems: 0,
                error: `Project structure invalid. Ensure .idea directory exists.`,
            };
        }

        throw error; // Re-throw unexpected errors
    }
}
```

## Performance Optimization

### 1. Caching Strategy

#### Result Caching

```typescript
interface CacheKey {
    path: string;
    profileHash: string;
    lastModified: number;
}

interface CachedResult {
    diagnostics: Diagnostic[];
    timestamp: number;
    ttl: number;
}

class InspectionCache {
    private cache = new Map<string, CachedResult>();

    get(key: CacheKey): CachedResult | null {
        const cacheKey = this.generateKey(key);
        const cached = this.cache.get(cacheKey);

        if (!cached || Date.now() > cached.timestamp + cached.ttl) {
            this.cache.delete(cacheKey);
            return null;
        }

        return cached;
    }

    set(key: CacheKey, result: Diagnostic[], ttl: number = 300000): void {
        const cacheKey = this.generateKey(key);
        this.cache.set(cacheKey, {
            diagnostics: result,
            timestamp: Date.now(),
            ttl,
        });
    }
}
```

#### Process Reuse

```typescript
class InspectionPool {
    private processes = new Map<string, ChildProcess>();

    async executeInspection(command: InspectionCommand): Promise<Diagnostic[]> {
        const processKey = this.getProcessKey(command);

        // Reuse existing process if available
        let process = this.processes.get(processKey);

        if (!process || process.killed) {
            process = this.createInspectionProcess(command);
            this.processes.set(processKey, process);
        }

        return this.sendInspectionRequest(process, command);
    }
}
```

### 2. Memory Management

#### Streaming Results

```typescript
function parseResultsStreaming(outputPath: string, callback: (diagnostic: Diagnostic) => void): void {
    const stream = fs.createReadStream(path.join(outputPath, 'results.json'));
    const parser = new StreamingJsonParser();

    parser.on('diagnostic', callback);
    parser.on('error', (error) => {
        throw new Error(`Failed to parse results: ${error.message}`);
    });

    stream.pipe(parser);
}
```

#### Cleanup Management

```typescript
class ResourceManager {
    private tempDirs: string[] = [];
    private processes: ChildProcess[] = [];

    createTempDirectory(): string {
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-inspection-'));
        this.tempDirs.push(tempDir);
        return tempDir;
    }

    cleanup(): void {
        // Clean up temporary directories
        this.tempDirs.forEach((dir) => {
            try {
                fs.rmSync(dir, { recursive: true, force: true });
            } catch (error) {
                console.warn(`Failed to clean up temp directory ${dir}:`, error);
            }
        });

        // Terminate processes
        this.processes.forEach((process) => {
            if (!process.killed) {
                process.kill('SIGTERM');
            }
        });

        this.tempDirs = [];
        this.processes = [];
    }
}
```

This technical integration ensures robust, performant, and reliable code inspection capabilities while leveraging the full power of JetBrains'
inspection engine across all supported IDEs.
