import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { InspectionTool, InspectionToolParams } from '../tools/InspectionTool.js';
import { MarkdownFormatter } from '../formatters/MarkdownFormatter.js';
import { JSONFormatter } from '../formatters/JSONFormatter.js';
import { ConfigLoader } from '../../infrastructure/config/ConfigLoader.js';
import { DependencyContainer } from '../../core/DependencyContainer.js';
import { Logger } from '../../shared/logger/Logger.js';

/**
 * Handles MCP protocol requests
 */
export class RequestHandlers {
    private inspectionTool: InspectionTool;
    private readonly logger = new Logger('RequestHandlers');

    constructor(
        private readonly server: Server,
        private readonly container: DependencyContainer,
    ) {
        this.inspectionTool = container.resolve<InspectionTool>('InspectionTool');
    }

    /**
     * Setup all request handlers
     */
    setup(): void {
        this.setupToolListHandler();
        this.setupToolCallHandler();
        this.logger.info('Request handlers setup complete');
    }

    private setupToolListHandler(): void {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            const tools = [this.inspectionTool.getDefinition()];

            this.logger.debug('Listed tools', { count: tools.length });

            return { tools };
        });
    }

    private setupToolCallHandler(): void {
        this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
            const { name, arguments: args } = request.params;

            if (name === 'get_jetbrains_code_inspections') {
                try {
                    this.logger.info('Executing inspection tool', { args });

                    const result = await this.inspectionTool.execute(args as InspectionToolParams);

                    // Format result based on configuration
                    const config = this.container.resolve<ConfigLoader>('ConfigLoader').getConfig();
                    const formatter =
                        config.responseFormat === 'json'
                            ? this.container.resolve<JSONFormatter>('JSONFormatter')
                            : this.container.resolve<MarkdownFormatter>('MarkdownFormatter');

                    const formatted = formatter.format(result);

                    return {
                        content: [
                            {
                                type: 'text',
                                text: formatted,
                            },
                        ],
                        isError: !!result.error,
                    };
                } catch (error) {
                    this.logger.error('Tool execution failed:', error);

                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(
                                    {
                                        error: error instanceof Error ? error.message : 'Unknown error',
                                        code: 'EXECUTION_ERROR',
                                    },
                                    null,
                                    2,
                                ),
                            },
                        ],
                        isError: true,
                    };
                }
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: `Unknown tool: ${name}`,
                    },
                ],
                isError: true,
            };
        });
    }
}
