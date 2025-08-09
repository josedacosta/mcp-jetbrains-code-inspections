import { DiagnosticSeverity } from '../../domain/models/Diagnostic.js';
import { ISeverityMapper } from '../../domain/interfaces/IParser.js';

/**
 * Maps JetBrains severity levels to standard severity levels
 */
export class SeverityMapper implements ISeverityMapper {
    private static readonly SEVERITY_MAP: Record<string, DiagnosticSeverity> = {
        ERROR: DiagnosticSeverity.ERROR,
        WARNING: DiagnosticSeverity.WARNING,
        'WEAK WARNING': DiagnosticSeverity.INFO,
        INFO: DiagnosticSeverity.INFO,
        INFORMATION: DiagnosticSeverity.INFO,
        TYPO: DiagnosticSeverity.WARNING,
        'SERVER PROBLEM': DiagnosticSeverity.ERROR,
        GENERIC_SERVER_ERROR_OR_WARNING: DiagnosticSeverity.WARNING,
        DEPRECATED: DiagnosticSeverity.WARNING,
        MARKED_FOR_REMOVAL: DiagnosticSeverity.WARNING,
    };

    /**
     * Map JetBrains severity to standard severity
     */
    mapSeverity(jetbrainsSeverity: string | undefined): DiagnosticSeverity {
        if (!jetbrainsSeverity) {
            return DiagnosticSeverity.INFO;
        }

        const normalizedSeverity = jetbrainsSeverity.toUpperCase();
        return SeverityMapper.SEVERITY_MAP[normalizedSeverity] || DiagnosticSeverity.INFO;
    }
}
