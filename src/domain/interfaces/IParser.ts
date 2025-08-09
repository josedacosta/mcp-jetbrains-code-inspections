import { Diagnostic, DiagnosticSeverity } from '../models/Diagnostic.js';
import { JetBrainsInspectionOutput } from '../models/InspectionResult.js';

export interface IDiagnosticParser {
    /**
     * Parse inspection output to diagnostics
     */
    parseOutput(output: JetBrainsInspectionOutput, targetFile: string): Diagnostic[];

    /**
     * Parse inspection results from output directory
     */
    parseDirectory(outputDir: string, targetFile: string): Promise<Diagnostic[]>;
}

export interface ISeverityMapper {
    /**
     * Map JetBrains severity to standard severity
     */
    mapSeverity(jetbrainsSeverity: string | undefined): DiagnosticSeverity;
}
