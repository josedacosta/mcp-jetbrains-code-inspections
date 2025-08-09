import { Diagnostic, DiagnosticFilter as FilterOptions, DiagnosticSeverity } from '../../domain/models/Diagnostic.js';
import { Logger } from '../../shared/logger/Logger.js';

/**
 * Filters diagnostics based on various criteria
 */
export class DiagnosticFilter {
    constructor(private readonly logger: Logger) {}

    /**
     * Apply filters to diagnostics
     */
    apply(diagnostics: Diagnostic[], options: FilterOptions): Diagnostic[] {
        let filtered = [...diagnostics];

        // Apply only filter (if specified, only include matching)
        if (options.only && options.only.length > 0) {
            filtered = this.applyOnlyFilter(filtered, options.only);
        }
        // Apply the exclude filter (if no only filter)
        else if (options.exclude && options.exclude.length > 0) {
            filtered = this.applyExcludeFilter(filtered, options.exclude);
        }

        // Apply severity filter
        if (options.severities && options.severities.length > 0) {
            filtered = this.applySeverityFilter(filtered, options.severities);
        }

        this.logger.debug('Applied filters', {
            original: diagnostics.length,
            filtered: filtered.length,
            options,
        });

        return filtered;
    }

    private applyOnlyFilter(diagnostics: Diagnostic[], codes: string[]): Diagnostic[] {
        return diagnostics.filter((d) => {
            if (!d.code) return false;
            return codes.some((code) => this.matchesCode(d.code!, code));
        });
    }

    private applyExcludeFilter(diagnostics: Diagnostic[], codes: string[]): Diagnostic[] {
        return diagnostics.filter((d) => {
            if (!d.code) return true;
            return !codes.some((code) => this.matchesCode(d.code!, code));
        });
    }

    private applySeverityFilter(diagnostics: Diagnostic[], severities: DiagnosticSeverity[]): Diagnostic[] {
        return diagnostics.filter((d) => severities.includes(d.severity));
    }

    private matchesCode(diagnosticCode: string, filterCode: string): boolean {
        // Support wildcards
        if (filterCode.includes('*')) {
            const pattern = filterCode.replace(/\*/g, '.*');
            const regex = new RegExp(`^${pattern}$`, 'i');
            return regex.test(diagnosticCode);
        }

        // Support namespace.code format
        if (filterCode.includes('.')) {
            return diagnosticCode === filterCode;
        }

        // Simple equality check (case-insensitive)
        return diagnosticCode.toLowerCase() === filterCode.toLowerCase();
    }
}
