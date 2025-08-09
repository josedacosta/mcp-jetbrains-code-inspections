import { IInspector, InspectionParams } from '../../domain/interfaces/IInspector.js';
import { InspectionResult } from '../../domain/models/InspectionResult.js';
import { InspectionStrategy } from './InspectionStrategy.js';
import { InspectionResultProcessor } from './InspectionResultProcessor.js';
import { Logger } from '../../shared/logger/Logger.js';

/**
 * Main executor for code inspections
 */
export class InspectionExecutor implements IInspector {
    constructor(
        private readonly strategy: InspectionStrategy,
        private readonly resultProcessor: InspectionResultProcessor,
        private readonly logger: Logger,
    ) {}

    async inspect(params: InspectionParams): Promise<InspectionResult> {
        const startTime = Date.now();
        this.logger.info('Starting inspection', { targetPath: params.targetPath });

        try {
            // Prepare inspection context
            const context = await this.strategy.prepare(params);
            this.logger.debug('Inspection context prepared', context);

            // Execute inspection
            const outputDir = await this.strategy.execute(context);
            this.logger.debug('Inspection executed', { outputDir });

            // Process results
            const result = await this.resultProcessor.process(outputDir, context, params.filter);

            // Add metadata
            const executionTime = Date.now() - startTime;
            result.metadata = {
                targetPath: context.targetPath,
                projectRoot: context.projectRoot,
                ideUsed: context.ideName,
                executionTime,
                timestamp: new Date(),
            };

            this.logger.info('Inspection completed', {
                totalProblems: result.totalProblems,
                executionTime,
            });

            // Cleanup
            await this.strategy.cleanup(context);

            return result;
        } catch (error) {
            this.logger.error('Inspection failed', error);
            throw error;
        }
    }
}
