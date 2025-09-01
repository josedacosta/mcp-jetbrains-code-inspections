import { z } from 'zod';
import { InspectionResult } from '../../domain/models/InspectionResult.js';
import { InspectionExecutor } from '../../core/inspection/InspectionExecutor.js';
import { Logger } from '../../shared/logger/Logger.js';

/**
 * MCP Tool for JetBrains code inspections
 *
 * Configuration via environment variables:
 * - FORCE_INSPECT_PATH: Force specific IDE inspect tool path (disables auto-detection)
 * - FORCE_PROJECT_ROOT: Force project root directory (disables auto-detection)
 * - FORCE_PROFILE_PATH: Force inspection profile path (disables default profile detection)
 * - INSPECTION_TIMEOUT: Timeout in milliseconds (default: 120000)
 * - EXCLUDE_INSPECTIONS: Comma-separated inspection codes to exclude
 * - ONLY_INSPECTIONS: Comma-separated inspection codes to include only
 */
export const InspectionToolSchema = z.object({
    path: z.string().describe('The file or directory path to analyze'),
});

export type InspectionToolParams = z.infer<typeof InspectionToolSchema>;

export class InspectionTool {
    constructor(
        private readonly executor: InspectionExecutor,
        private readonly logger: Logger,
    ) {}

    /**
     * Get tool definition for MCP
     */
    getDefinition() {
        return {
            name: 'get_jetbrains_code_inspections',
            description: 'Run JetBrains IDE code inspections on files or directories',
            inputSchema: {
                type: 'object',
                properties: {
                    path: {
                        type: 'string',
                        description: 'File or directory path to inspect',
                    },
                },
                required: ['path'],
            },
        };
    }

    /**
     * Execute the inspection tool
     */
    async execute(params: InspectionToolParams): Promise<InspectionResult> {
        this.logger.info('Executing inspection', { path: params.path });

        try {
            // Validate parameters
            const validated = InspectionToolSchema.parse(params);

            // Get configuration from environment variables
            // FORCE_* variables disable automatic detection when set
            const projectRoot = process.env.FORCE_PROJECT_ROOT || undefined;
            const profilePath = process.env.FORCE_PROFILE_PATH || undefined;

            // Inspection configuration
            const timeoutMs = process.env.INSPECTION_TIMEOUT ? parseInt(process.env.INSPECTION_TIMEOUT, 10) : undefined;
            const exclude = process.env.EXCLUDE_INSPECTIONS?.split(',')
                .map((s) => s.trim())
                .filter(Boolean);
            const only = process.env.ONLY_INSPECTIONS?.split(',')
                .map((s) => s.trim())
                .filter(Boolean);

            // Build inspection parameters
            const inspectionParams = {
                targetPath: validated.path,
                projectRoot: projectRoot,
                profilePath: profilePath,
                filter: {
                    exclude: exclude,
                    only: only,
                },
                timeout: timeoutMs,
            };

            // Execute inspection
            const result = await this.executor.inspect(inspectionParams);

            this.logger.info('Inspection completed', {
                totalProblems: result.totalProblems,
                path: params.path,
            });

            return result;
        } catch (error) {
            this.logger.error('Inspection failed', error);

            if (error instanceof z.ZodError) {
                return {
                    totalProblems: 0,
                    diagnostics: [],
                    error: `Invalid parameters: ${error.errors.map((e) => e.message).join(', ')}`,
                };
            }

            return {
                totalProblems: 0,
                diagnostics: [],
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }
}
