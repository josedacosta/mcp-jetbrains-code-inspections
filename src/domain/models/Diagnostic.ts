/**
 * Domain model for diagnostic information
 */
export interface Diagnostic {
    file: string;
    line: number;
    column: number;
    length?: number;
    severity: DiagnosticSeverity;
    code?: string;
    message: string;
    highlightedElement?: string;
    category?: string;
    hints?: string[];
}

export enum DiagnosticSeverity {
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info',
}

export interface DiagnosticFilter {
    exclude?: string[];
    only?: string[];
    severities?: DiagnosticSeverity[];
}

export class DiagnosticBuilder {
    private readonly diagnostic: Partial<Diagnostic> = {};

    withFile(file: string): this {
        this.diagnostic.file = file;
        return this;
    }

    withLocation(line: number, column: number, length?: number): this {
        this.diagnostic.line = Math.max(1, line);
        this.diagnostic.column = Math.max(1, column);
        if (length !== undefined && length !== 0) {
            this.diagnostic.length = length;
        }
        return this;
    }

    withSeverity(severity: DiagnosticSeverity): this {
        this.diagnostic.severity = severity;
        return this;
    }

    withCode(code: string | undefined): this {
        if (code && code !== 'UNKNOWN') {
            this.diagnostic.code = code;
        }
        return this;
    }

    withMessage(message: string): this {
        this.diagnostic.message = message;
        return this;
    }

    withHighlightedElement(element: string | undefined): this {
        if (element && element.trim() !== '') {
            this.diagnostic.highlightedElement = element;
        }
        return this;
    }

    withCategory(category: string | undefined): this {
        if (category) {
            this.diagnostic.category = category;
        }
        return this;
    }

    withHints(hints: string[] | undefined): this {
        if (hints && hints.length > 0) {
            this.diagnostic.hints = hints;
        }
        return this;
    }

    build(): Diagnostic {
        if (!this.diagnostic.file || !this.diagnostic.line || !this.diagnostic.column || !this.diagnostic.severity || !this.diagnostic.message) {
            throw new Error('Missing required diagnostic fields');
        }
        return this.diagnostic as Diagnostic;
    }
}
