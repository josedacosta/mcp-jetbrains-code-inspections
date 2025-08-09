---
sidebar_position: 7
title: Inspection Consistency
description: Ensuring deterministic and reproducible inspection results
---

# Inspection Consistency

## Overview

This document explains how the MCP JetBrains Code Inspections server ensures consistent, deterministic results across different runs, environments,
and configurations.

## Consistency Principles

### 1. Deterministic Execution

Every inspection run with the same inputs should produce identical outputs:

```typescript
// From InspectionExecutor.ts
async inspect(params: InspectionParams): Promise<InspectionResult> {
    // Always use the same execution flow
    const ide = await this.ideSelector.select();
    const profile = await this.profileManager.resolve(params);
    const command = this.strategy.buildCommand(params);
    const result = await this.execute(command);
    return this.processor.process(result);
}
```

### 2. Isolated Execution Environment

Each inspection runs in an isolated environment:

```typescript
// From InspectionStrategy.ts
private createIsolatedEnvironment(): EnvironmentConfig {
    return {
        // Separate config directory to avoid conflicts
        configPath: path.join(os.tmpdir(), 'idea-config', process.pid.toString()),
        // Separate system directory for caches
        systemPath: path.join(os.tmpdir(), 'idea-system', process.pid.toString()),
        // Consistent JVM options
        jvmOptions: [
            '-Xmx2048m',
            '-XX:+UseG1GC',
            '-Djava.awt.headless=true'
        ]
    };
}
```

### 3. Stable Output Ordering

Results are consistently ordered:

```typescript
// From ResultParser.ts
private sortDiagnostics(diagnostics: Diagnostic[]): Diagnostic[] {
    return diagnostics.sort((a, b) => {
        // First by file path
        const fileCompare = a.file.localeCompare(b.file);
        if (fileCompare !== 0) return fileCompare;

        // Then by line number
        const lineCompare = a.line - b.line;
        if (lineCompare !== 0) return lineCompare;

        // Finally by column
        return (a.column || 0) - (b.column || 0);
    });
}
```

## Configuration Management

### Environment Variable Consistency

All configuration is managed through environment variables:

```bash
# Consistent configuration across runs
export FORCE_INSPECT_PATH="/Applications/WebStorm.app/Contents/bin/inspect.sh"
export FORCE_PROJECT_ROOT="/path/to/project"
export FORCE_PROFILE_PATH="/path/to/profile.xml"
export INSPECTION_TIMEOUT="120000"
export EXCLUDE_INSPECTIONS="SpellCheckingInspection"
export RESPONSE_FORMAT="json"
```

### Profile Management

The `InspectionProfileManager` ensures consistent profile usage:

```typescript
export class InspectionProfileManager {
    private profileCache = new Map<string, string>();

    async resolveProfile(options: ProfileOptions): Promise<string> {
        const cacheKey = this.getCacheKey(options);

        // Return cached profile for consistency
        if (this.profileCache.has(cacheKey)) {
            return this.profileCache.get(cacheKey)!;
        }

        const profile = await this.findProfile(options);
        this.profileCache.set(cacheKey, profile);
        return profile;
    }
}
```

## Handling Non-Deterministic Elements

### 1. Timestamps

Remove or normalize timestamps from output:

```typescript
class DiagnosticNormalizer {
    normalize(diagnostic: RawDiagnostic): NormalizedDiagnostic {
        // Remove timestamp fields
        const { timestamp, ...rest } = diagnostic;

        return {
            ...rest,
            // Use stable identifiers
            id: this.generateStableId(rest),
        };
    }

    private generateStableId(diagnostic: any): string {
        // Create deterministic ID from content
        const content = `${diagnostic.file}:${diagnostic.line}:${diagnostic.column}:${diagnostic.inspection}`;
        return crypto.createHash('sha256').update(content).digest('hex').slice(0, 8);
    }
}
```

### 2. File System Paths

Normalize all paths to be relative:

```typescript
class PathNormalizer {
    normalize(absolutePath: string, projectRoot: string): string {
        // Always use forward slashes
        const normalized = absolutePath.replace(/\\/g, '/');

        // Make relative to project root
        if (normalized.startsWith(projectRoot)) {
            return path.relative(projectRoot, normalized).replace(/\\/g, '/');
        }

        return normalized;
    }
}
```

### 3. Random Inspection Order

Force consistent inspection execution order:

```typescript
class InspectionOrdering {
    orderInspections(inspections: Inspection[]): Inspection[] {
        // Sort by inspection ID for consistency
        return inspections.sort((a, b) => a.id.localeCompare(b.id));
    }
}
```

## Version Compatibility

### IDE Version Management

Track and handle IDE version differences:

```typescript
interface IDEVersion {
    major: number;
    minor: number;
    patch: number;
    build: string;
}

class VersionCompatibility {
    ensureCompatibility(ide: IDE): void {
        const version = this.parseVersion(ide.version);

        // Warn about version differences
        if (this.hasBreakingChanges(version)) {
            this.logger.warn(`IDE version ${ide.version} may produce different results`);
        }

        // Apply version-specific adjustments
        this.applyVersionAdjustments(version);
    }
}
```

### Profile Version Compatibility

Handle profile format changes:

```xml
<!-- Profile with version information -->
<profile version="1.0">
  <option name="myName" value="Unified" />
  <option name="PROFILE_VERSION" value="2023.3" />

  <!-- Version-specific settings -->
  <inspection_tool class="ModernInspection" enabled="true" level="WARNING">
    <!-- Only in 2023.3+ -->
    <option name="requiresVersion" value="2023.3" />
  </inspection_tool>
</profile>
```

## Caching Strategy

### Result Caching

Implement deterministic caching:

```typescript
class InspectionCache {
    private cache = new Map<string, CachedResult>();

    getCacheKey(params: InspectionParams): string {
        // Create deterministic cache key
        const elements = [
            params.targetPath,
            params.profilePath || 'default',
            params.filter?.only?.sort().join(',') || '',
            params.filter?.exclude?.sort().join(',') || '',
            this.getFileHash(params.targetPath),
        ];

        return crypto.createHash('sha256').update(elements.join('|')).digest('hex');
    }

    private getFileHash(targetPath: string): string {
        // Hash file contents for cache invalidation
        const content = fs.readFileSync(targetPath, 'utf8');
        return crypto.createHash('md5').update(content).digest('hex');
    }
}
```

### Cache Invalidation

Properly invalidate caches:

```typescript
class CacheInvalidator {
    shouldInvalidate(cached: CachedResult, current: FileInfo): boolean {
        return (
            // File modified
            cached.fileHash !== current.hash ||
            // Profile changed
            cached.profileHash !== current.profileHash ||
            // IDE version changed
            cached.ideVersion !== current.ideVersion ||
            // Cache expired
            Date.now() - cached.timestamp > this.maxAge
        );
    }
}
```

## Testing Consistency

### Regression Testing

Ensure consistent results across changes:

```typescript
describe('Inspection Consistency', () => {
    it('should produce identical results for multiple runs', async () => {
        const params = {
            targetPath: 'test/fixtures/sample.ts',
            profilePath: 'test/fixtures/profile.xml',
        };

        const result1 = await executor.inspect(params);
        const result2 = await executor.inspect(params);

        expect(result1).toEqual(result2);
    });

    it('should maintain consistency across IDE restarts', async () => {
        const result1 = await executor.inspect(params);

        // Simulate IDE restart
        await executor.restart();

        const result2 = await executor.inspect(params);

        expect(normalizeResults(result1)).toEqual(normalizeResults(result2));
    });
});
```

### Consistency Metrics

Track consistency over time:

```typescript
class ConsistencyMonitor {
    async checkConsistency(params: InspectionParams): Promise<ConsistencyReport> {
        const results: InspectionResult[] = [];

        // Run multiple times
        for (let i = 0; i < 5; i++) {
            results.push(await this.executor.inspect(params));
        }

        return {
            consistent: this.areResultsIdentical(results),
            variance: this.calculateVariance(results),
            differences: this.findDifferences(results),
        };
    }
}
```

## Common Consistency Issues

### 1. Timing-Dependent Results

**Problem**: Some inspections depend on timing or external resources.

**Solution**:

```typescript
class TimingNormalizer {
    normalize(diagnostic: Diagnostic): Diagnostic {
        // Remove timing-sensitive information
        if (diagnostic.message.includes('took')) {
            diagnostic.message = diagnostic.message.replace(/took \d+ms/, 'took Xms');
        }
        return diagnostic;
    }
}
```

### 2. Plugin Loading Order

**Problem**: Plugins may load in different orders.

**Solution**:

```typescript
class PluginManager {
    async loadPlugins(): Promise<Plugin[]> {
        const plugins = await this.discoverPlugins();
        // Always load in alphabetical order
        return plugins.sort((a, b) => a.id.localeCompare(b.id));
    }
}
```

### 3. Locale Differences

**Problem**: Different system locales affect messages.

**Solution**:

```bash
# Force consistent locale
export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8
```

## Best Practices for Consistency

### 1. Use Explicit Configuration

Always specify configuration explicitly:

```json
{
    "env": {
        "FORCE_INSPECT_PATH": "/path/to/inspect.sh",
        "FORCE_PROJECT_ROOT": "/path/to/project",
        "FORCE_PROFILE_PATH": "/path/to/profile.xml",
        "INSPECTION_TIMEOUT": "120000"
    }
}
```

### 2. Version Lock

Lock IDE and plugin versions:

```json
{
    "requirements": {
        "ide": "WebStorm 2023.3.2",
        "plugins": {
            "eslint": "2.4.0",
            "prettier": "1.2.3"
        }
    }
}
```

### 3. Isolated Execution

Run inspections in isolated environments:

```bash
# Use Docker for complete isolation
docker run -v $(pwd):/project \
  mcp-jetbrains-inspections \
  inspect /project/src
```

### 4. Result Verification

Implement result verification:

```typescript
class ResultVerifier {
    verify(result: InspectionResult): boolean {
        return (
            this.hasExpectedStructure(result) && this.hasValidSeverities(result) && this.hasConsistentPaths(result) && this.hasNoDuplicates(result)
        );
    }
}
```

## Monitoring and Debugging

### Consistency Logging

Enable detailed logging for debugging:

```typescript
class ConsistencyLogger {
    logInspectionRun(params: InspectionParams, result: InspectionResult): void {
        const entry = {
            timestamp: new Date().toISOString(),
            params: this.sanitizeParams(params),
            result: {
                totalProblems: result.totalProblems,
                checksum: this.calculateChecksum(result),
            },
            environment: {
                ide: process.env.FORCE_INSPECT_PATH,
                profile: process.env.FORCE_PROFILE_PATH,
                nodeVersion: process.version,
            },
        };

        this.logger.info('Inspection run', entry);
    }
}
```

### Diff Analysis

Analyze differences between runs:

```typescript
class DiffAnalyzer {
    analyze(result1: InspectionResult, result2: InspectionResult): DiffReport {
        return {
            added: this.findAdded(result1, result2),
            removed: this.findRemoved(result1, result2),
            changed: this.findChanged(result1, result2),
            summary: this.generateSummary(result1, result2),
        };
    }
}
```

## Performance vs Consistency Trade-offs

### Caching Strategies

Balance performance with consistency:

```typescript
enum CacheStrategy {
    NONE = 'none', // Always fresh, slowest
    CONSERVATIVE = 'conservative', // Cache with strict invalidation
    AGGRESSIVE = 'aggressive', // Cache aggressively, fastest
}

class CacheManager {
    constructor(private strategy: CacheStrategy) {}

    async get(key: string): Promise<InspectionResult | null> {
        switch (this.strategy) {
            case CacheStrategy.NONE:
                return null;
            case CacheStrategy.CONSERVATIVE:
                return this.getIfValid(key);
            case CacheStrategy.AGGRESSIVE:
                return this.getRegardless(key);
        }
    }
}
```

### Parallel Execution

Maintain consistency with parallel processing:

```typescript
class ParallelExecutor {
    async inspectParallel(files: string[]): Promise<InspectionResult[]> {
        // Sort files for consistent ordering
        const sortedFiles = files.sort();

        // Process in deterministic batches
        const batchSize = 4;
        const results: InspectionResult[] = [];

        for (let i = 0; i < sortedFiles.length; i += batchSize) {
            const batch = sortedFiles.slice(i, i + batchSize);
            const batchResults = await Promise.all(batch.map((file) => this.inspect(file)));
            results.push(...batchResults);
        }

        return results;
    }
}
```

## Future Improvements

### Planned Enhancements

1. **Checksum Verification**: Verify result integrity with checksums
2. **Reproducible Builds**: Support fully reproducible inspection runs
3. **Consistency Testing**: Automated consistency regression tests
4. **Drift Detection**: Detect when results start to drift

### Research Areas

1. **Machine Learning**: Detect and correct inconsistencies automatically
2. **Distributed Inspection**: Consistent results across distributed systems
3. **Version Migration**: Automatic migration between IDE versions

## References

- [Deterministic Builds](https://reproducible-builds.org/)
- [JetBrains Platform Stability](https://plugins.jetbrains.com/docs/intellij/platform-stability.html)
- [Software Testing Best Practices](https://martinfowler.com/testing/)
