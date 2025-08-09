import * as path from 'path';
import * as fs from 'fs/promises';
import { Diagnostic, DiagnosticBuilder } from '../../domain/models/Diagnostic.js';
import { JetBrainsInspectionOutput, JetBrainsInspectionProblem } from '../../domain/models/InspectionResult.js';
import { IDiagnosticParser } from '../../domain/interfaces/IParser.js';
import { SeverityMapper } from './SeverityMapper.js';
import { DiagnosticNormalizer } from './DiagnosticNormalizer.js';
import { Logger } from '../../shared/logger/Logger.js';

/**
 * Parses JetBrains inspection results
 */
export class ResultParser implements IDiagnosticParser {
    constructor(
        private readonly severityMapper: SeverityMapper,
        private readonly normalizer: DiagnosticNormalizer,
        private readonly logger: Logger,
    ) {}

    /**
     * Parse inspection output to diagnostics
     */
    parseOutput(output: JetBrainsInspectionOutput, targetFile: string): Diagnostic[] {
        const diagnostics: Diagnostic[] = [];
        const targetFileName = path.basename(targetFile);
        const targetFileNormalized = path.normalize(targetFile);

        if (!output.problems || !Array.isArray(output.problems)) {
            return diagnostics;
        }

        for (const problem of output.problems) {
            if (!this.matchesTargetFile(problem, targetFileName, targetFileNormalized)) {
                continue;
            }

            try {
                const diagnostic = this.createDiagnostic(problem);
                if (!this.isDuplicate(diagnostic, diagnostics)) {
                    diagnostics.push(diagnostic);
                }
            } catch (error) {
                this.logger.warn('Failed to parse problem', { problem, error });
            }
        }

        return diagnostics;
    }

    /**
     * Parse inspection results from output directory
     */
    async parseDirectory(outputDir: string, targetFile: string): Promise<Diagnostic[]> {
        const diagnostics: Diagnostic[] = [];

        try {
            const files = await fs.readdir(outputDir);
            const jsonFiles = files.filter((f) => f.endsWith('.json') && !f.startsWith('.'));

            this.logger.debug(`Found ${jsonFiles.length} JSON files in output directory`);

            for (const jsonFile of jsonFiles) {
                const filePath = path.join(outputDir, jsonFile);

                try {
                    const content = await fs.readFile(filePath, 'utf-8');

                    if (!content.trim()) {
                        this.logger.debug(`Skipping empty file: ${jsonFile}`);
                        continue;
                    }

                    const data: JetBrainsInspectionOutput = JSON.parse(content);
                    const fileDiagnostics = this.parseOutput(data, targetFile);
                    diagnostics.push(...fileDiagnostics);
                } catch (error) {
                    this.logger.error(`Error parsing file ${jsonFile}:`, error);
                }
            }

            this.logger.info(`Parsed ${diagnostics.length} diagnostics for ${path.basename(targetFile)}`);
        } catch (error) {
            this.logger.error('Error reading inspection results directory:', error);
            throw new Error(`Failed to parse inspection results: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        return diagnostics;
    }

    private matchesTargetFile(problem: JetBrainsInspectionProblem, targetFileName: string, targetFileNormalized: string): boolean {
        if (!problem.file) {
            return false;
        }

        return problem.file.includes(targetFileName) || path.normalize(problem.file) === targetFileNormalized;
    }

    private createDiagnostic(problem: JetBrainsInspectionProblem): Diagnostic {
        const normalizedFile = this.normalizer.normalizeFilePath(problem.file);
        const problemClassId = this.extractProblemClassId(problem);
        const description = this.formatDescription(problem.description, problemClassId);
        const severity = this.severityMapper.mapSeverity(problem.severity || problem.problem_class?.severity);

        return new DiagnosticBuilder()
            .withFile(normalizedFile)
            .withLocation(problem.line || 1, problem.offset || 1, problem.length)
            .withSeverity(severity)
            .withCode(problemClassId)
            .withMessage(description)
            .withHighlightedElement(problem.highlighted_element)
            .withCategory(problem.category)
            .withHints(problem.hints)
            .build();
    }

    private extractProblemClassId(problem: JetBrainsInspectionProblem): string | undefined {
        const id = problem.problem_class?.id || problem.problemClass;
        return id !== 'UNKNOWN' ? id : undefined;
    }

    private formatDescription(description: string, problemClassId?: string): string {
        if (!description) {
            return 'No description provided';
        }

        if (problemClassId && !description.startsWith(problemClassId + ':')) {
            return `${problemClassId}: ${description}`;
        }

        return description;
    }

    private isDuplicate(diagnostic: Diagnostic, existingDiagnostics: Diagnostic[]): boolean {
        return existingDiagnostics.some((d) => d.line === diagnostic.line && d.column === diagnostic.column && d.code === diagnostic.code);
    }
}
