import { InspectionResult } from '../../domain/models/InspectionResult.js';
import { Diagnostic, DiagnosticSeverity } from '../../domain/models/Diagnostic.js';
import { IFormatter } from '../../domain/interfaces/IFormatter.js';

/**
 * Formats inspection results as Markdown
 */
export class MarkdownFormatter implements IFormatter {
    format(result: InspectionResult): string {
        if (result.error) {
            return this.formatError(result.error);
        }

        if (result.warning) {
            return this.formatWarning(result.warning, result.totalProblems);
        }

        if (result.diagnostics.length === 0) {
            return this.formatNoIssues();
        }

        return this.formatDiagnostics(result);
    }

    private formatError(error: string): string {
        return `❌ **Inspection Error**\n\n${error}`;
    }

    private formatWarning(warning: string, totalProblems: number): string {
        return `⚠️ **Warning**: ${warning}\n\n${totalProblems} problems found`;
    }

    private formatNoIssues(): string {
        return '✅ **No issues found** - Code inspection completed successfully with no problems detected.';
    }

    private formatDiagnostics(result: InspectionResult): string {
        const { diagnostics } = result;

        // Group by severity
        const severityGroups = this.groupBySeverity(diagnostics);
        const { errors, warnings, infos } = severityGroups;

        // Start with summary line
        let output = `⚠️ **Issues found** - ${result.totalProblems} problem${result.totalProblems !== 1 ? 's' : ''} detected`;

        // Add severity breakdown
        const severityCounts = this.getSeverityCounts(severityGroups);
        if (severityCounts.length > 0) {
            output += ` (${severityCounts.join(', ')})`;
        }
        output += '.\n\n';

        // Add detailed results header
        output += '## Code Inspection Results\n\n';
        output += `**Total Issues**: ${result.totalProblems}\n`;
        output += this.formatSeveritySummary(severityGroups);
        output += '\n---\n\n';

        // Format each diagnostic group
        if (errors.length > 0) {
            output += '### 🔴 Errors\n\n';
            output += this.formatDiagnosticGroup(errors);
        }

        if (warnings.length > 0) {
            output += '### 🟡 Warnings\n\n';
            output += this.formatDiagnosticGroup(warnings);
        }

        if (infos.length > 0) {
            output += '### 🔵 Information\n\n';
            output += this.formatDiagnosticGroup(infos);
        }

        return output;
    }

    private groupBySeverity(diagnostics: Diagnostic[]): { errors: Diagnostic[]; warnings: Diagnostic[]; infos: Diagnostic[] } {
        return {
            errors: diagnostics.filter((d) => d.severity === DiagnosticSeverity.ERROR),
            warnings: diagnostics.filter((d) => d.severity === DiagnosticSeverity.WARNING),
            infos: diagnostics.filter((d) => d.severity === DiagnosticSeverity.INFO),
        };
    }

    private getSeverityCounts(groups: { errors: Diagnostic[]; warnings: Diagnostic[]; infos: Diagnostic[] }): string[] {
        const counts = [];
        if (groups.errors.length > 0) {
            counts.push(`${groups.errors.length} error${groups.errors.length !== 1 ? 's' : ''}`);
        }
        if (groups.warnings.length > 0) {
            counts.push(`${groups.warnings.length} warning${groups.warnings.length !== 1 ? 's' : ''}`);
        }
        if (groups.infos.length > 0) {
            counts.push(`${groups.infos.length} info${groups.infos.length !== 1 ? 's' : ''}`);
        }
        return counts;
    }

    private formatSeveritySummary(groups: { errors: Diagnostic[]; warnings: Diagnostic[]; infos: Diagnostic[] }): string {
        let summary = '';
        if (groups.errors.length > 0) {
            summary += `- 🔴 Errors: ${groups.errors.length}\n`;
        }
        if (groups.warnings.length > 0) {
            summary += `- 🟡 Warnings: ${groups.warnings.length}\n`;
        }
        if (groups.infos.length > 0) {
            summary += `- 🔵 Info: ${groups.infos.length}\n`;
        }
        return summary;
    }

    private formatDiagnosticGroup(diagnostics: Diagnostic[]): string {
        let output = '';

        // Group by file
        const byFile = new Map<string, Diagnostic[]>();
        for (const diagnostic of diagnostics) {
            const group = byFile.get(diagnostic.file) || [];
            group.push(diagnostic);
            byFile.set(diagnostic.file, group);
        }

        for (const [file, fileDiagnostics] of byFile) {
            output += `#### 📄 \`${file}\`\n\n`;

            // Sort by line number
            fileDiagnostics.sort((a, b) => a.line - b.line);

            for (const diagnostic of fileDiagnostics) {
                output += this.formatSingleDiagnostic(diagnostic);
                output += '\n';
            }
        }

        return output;
    }

    private formatSingleDiagnostic(diagnostic: Diagnostic): string {
        let output = '';

        // Location
        output += `- **Line ${diagnostic.line}, Column ${diagnostic.column}**`;
        if (diagnostic.length) {
            output += ` (length: ${diagnostic.length})`;
        }
        output += '\n';

        // Code
        if (diagnostic.code) {
            output += `  - Code: \`${diagnostic.code}\`\n`;
        }

        // Message
        output += `  - ${diagnostic.message}\n`;

        // Highlighted element
        if (diagnostic.highlightedElement) {
            output += `  - Element: \`${diagnostic.highlightedElement}\`\n`;
        }

        // Category
        if (diagnostic.category) {
            output += `  - Category: ${diagnostic.category}\n`;
        }

        // Hints
        if (diagnostic.hints && diagnostic.hints.length > 0) {
            output += '  - Hints:\n';
            for (const hint of diagnostic.hints) {
                output += `    - ${hint}\n`;
            }
        }

        return output;
    }
}
