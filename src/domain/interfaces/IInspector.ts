import { InspectionResult } from '../models/InspectionResult.js';
import { DiagnosticFilter } from '../models/Diagnostic.js';

/**
 * Interface for inspection executors
 */
export interface IInspector {
    /**
     * Execute code inspection on the given path
     */
    inspect(params: InspectionParams): Promise<InspectionResult>;
}

export interface InspectionParams {
    targetPath: string;
    projectRoot?: string;
    profilePath?: string;
    filter?: DiagnosticFilter;
    timeout?: number;
    verbose?: boolean;
}

export interface InspectionContext {
    targetPath: string;
    projectRoot: string;
    profilePath: string | null;
    outputDir: string;
    ideePath: string;
    ideName: string;
    timeout: number;
}

export interface IInspectionStrategy {
    /**
     * Prepare the inspection context
     */
    prepare(params: InspectionParams): Promise<InspectionContext>;

    /**
     * Execute the inspection
     */
    execute(context: InspectionContext): Promise<string>;

    /**
     * Clean up after inspection
     */
    cleanup(context: InspectionContext): Promise<void>;
}
