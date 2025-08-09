import { Diagnostic } from './Diagnostic.js';

/**
 * Domain model for inspection results
 */
export interface InspectionResult {
    totalProblems: number;
    diagnostics: Diagnostic[];
    error?: string;
    warning?: string;
    timeout?: boolean;
    metadata?: InspectionMetadata;
}

export interface InspectionMetadata {
    targetPath: string;
    projectRoot: string;
    ideUsed: string;
    ideVersion?: string;
    executionTime: number;
    timestamp: Date;
}

export interface JetBrainsInspectionProblem {
    file: string;
    line?: number;
    offset?: number;
    length?: number;
    severity?: string;
    problem_class?: {
        name: string;
        id: string;
        severity?: string;
        attribute_key?: string;
    };
    problemClass?: string; // Legacy field
    description: string;
    category?: string;
    hints?: string[];
    highlighted_element?: string;
}

export interface JetBrainsInspectionOutput {
    problems: JetBrainsInspectionProblem[];
    metadata?: Record<string, unknown>;
}

export class InspectionResultBuilder {
    private readonly result: Partial<InspectionResult> = {
        totalProblems: 0,
        diagnostics: [],
    };

    withDiagnostics(diagnostics: Diagnostic[]): this {
        this.result.diagnostics = diagnostics;
        this.result.totalProblems = diagnostics.length;
        return this;
    }

    withError(error: string): this {
        this.result.error = error;
        return this;
    }

    build(): InspectionResult {
        return {
            totalProblems: this.result.totalProblems || 0,
            diagnostics: this.result.diagnostics || [],
            ...this.result,
        };
    }
}
