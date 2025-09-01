import { InspectionResult, InspectionResultBuilder } from '../../domain/models/InspectionResult.js';
import { DiagnosticFilter } from '../../domain/models/Diagnostic.js';
import { InspectionContext } from '../../domain/interfaces/IInspector.js';
import { ResultParser } from '../parsing/ResultParser.js';
import { DiagnosticFilter as Filter } from '../parsing/DiagnosticFilter.js';
import { Logger } from '../../shared/logger/Logger.js';

/**
 * Processes inspection results from output directory
 */
export class InspectionResultProcessor {
    constructor(
        private readonly parser: ResultParser,
        private readonly filter: Filter,
        private readonly logger: Logger,
    ) {}

    async process(outputDir: string, context: InspectionContext, filterOptions?: DiagnosticFilter): Promise<InspectionResult> {
        try {
            // Parse diagnostics from output directory
            const diagnostics = await this.parser.parseDirectory(outputDir, context.targetPath);

            // Apply filters
            const filteredDiagnostics = filterOptions ? this.filter.apply(diagnostics, filterOptions) : diagnostics;

            // Build result
            const result = new InspectionResultBuilder().withDiagnostics(filteredDiagnostics).build();

            this.logger.debug('Processed inspection results', {
                totalDiagnostics: diagnostics.length,
                filteredDiagnostics: filteredDiagnostics.length,
            });

            return result;
        } catch (error) {
            this.logger.error('Failed to process inspection results', error);

            return new InspectionResultBuilder().withError(error instanceof Error ? error.message : 'Unknown error').build();
        }
    }
}
