import * as path from 'path';

/**
 * Normalizes diagnostic data from various formats
 */
export class DiagnosticNormalizer {
    /**
     * Normalize file path from JetBrains format
     */
    normalizeFilePath(filePath: string): string {
        let normalized = filePath;

        // Remove file:// prefix
        if (normalized.startsWith('file://')) {
            normalized = normalized.slice(7);
        }

        // Remove $PROJECT_DIR$ placeholder
        if (normalized.includes('$PROJECT_DIR$')) {
            normalized = normalized.replace('file://$PROJECT_DIR$/', '').replace('$PROJECT_DIR$/', '');
        }

        // Remove $MODULE_DIR$ placeholder
        if (normalized.includes('$MODULE_DIR$')) {
            normalized = normalized.replace('file://$MODULE_DIR$/', '').replace('$MODULE_DIR$/', '');
        }

        // Normalize path separators
        normalized = path.normalize(normalized);

        return normalized;
    }
}
