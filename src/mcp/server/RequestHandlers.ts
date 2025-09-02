import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ListPromptsRequestSchema,
    GetPromptRequestSchema,
    ListResourcesRequestSchema,
    ReadResourceRequestSchema,
    CallToolRequest,
    GetPromptRequest,
    ReadResourceRequest,
} from '@modelcontextprotocol/sdk/types.js';
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
        this.setupPromptHandlers();
        this.setupResourceHandlers();
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
        this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
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

    private setupPromptHandlers(): void {
        // List available prompts
        this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
            const prompts = [
                {
                    name: 'analyze-project',
                    description: 'Analyze a project for code quality issues',
                    arguments: [
                        {
                            name: 'projectPath',
                            description: 'Path to the project to analyze',
                            required: true,
                        },
                        {
                            name: 'profile',
                            description: 'Inspection profile to use',
                            required: false,
                        },
                    ],
                },
                {
                    name: 'check-file',
                    description: 'Check a specific file for issues',
                    arguments: [
                        {
                            name: 'filePath',
                            description: 'Path to the file to check',
                            required: true,
                        },
                    ],
                },
                {
                    name: 'fix-issues',
                    description: 'Get suggestions to fix detected issues',
                    arguments: [
                        {
                            name: 'projectPath',
                            description: 'Path to the project',
                            required: true,
                        },
                        {
                            name: 'severity',
                            description: 'Minimum severity level (ERROR, WARNING, INFO)',
                            required: false,
                        },
                    ],
                },
            ];

            this.logger.debug('Listed prompts', { count: prompts.length });
            return { prompts };
        });

        // Get a specific prompt
        this.server.setRequestHandler(GetPromptRequestSchema, async (request: GetPromptRequest) => {
            const { name, arguments: args } = request.params;

            const prompts: Record<
                string,
                (args: Record<string, unknown>) => { messages: Array<{ role: string; content: { type: string; text: string } }> }
            > = {
                'analyze-project': (args: Record<string, unknown>) => ({
                    messages: [
                        {
                            role: 'user',
                            content: {
                                type: 'text',
                                text: `Please analyze the project at ${args.projectPath} using JetBrains inspections${args.profile ? ` with profile "${args.profile}"` : ''}.`,
                            },
                        },
                    ],
                }),
                'check-file': (args: Record<string, unknown>) => ({
                    messages: [
                        {
                            role: 'user',
                            content: {
                                type: 'text',
                                text: `Check the file at ${args.filePath} for code quality issues using JetBrains inspections.`,
                            },
                        },
                    ],
                }),
                'fix-issues': (args: Record<string, unknown>) => ({
                    messages: [
                        {
                            role: 'user',
                            content: {
                                type: 'text',
                                text: `Analyze the project at ${args.projectPath} and provide fix suggestions for issues${args.severity ? ` with severity ${args.severity} or higher` : ''}.`,
                            },
                        },
                    ],
                }),
            };

            const promptHandler = prompts[name];
            if (promptHandler) {
                return promptHandler(args || {});
            }

            throw new Error(`Unknown prompt: ${name}`);
        });
    }

    private setupResourceHandlers(): void {
        // List available resources
        this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
            const resources = [
                {
                    uri: 'inspection://profiles',
                    name: 'Available Inspection Profiles',
                    description: 'List of available inspection profiles',
                    mimeType: 'application/json',
                },
                {
                    uri: 'inspection://config',
                    name: 'Current Configuration',
                    description: 'Current MCP server configuration',
                    mimeType: 'application/json',
                },
                {
                    uri: 'inspection://ides',
                    name: 'Detected IDEs',
                    description: 'List of detected JetBrains IDEs on the system',
                    mimeType: 'application/json',
                },
            ];

            this.logger.debug('Listed resources', { count: resources.length });
            return { resources };
        });

        // Read a specific resource
        this.server.setRequestHandler(ReadResourceRequestSchema, async (request: ReadResourceRequest) => {
            const { uri } = request.params;

            if (uri === 'inspection://profiles') {
                return {
                    contents: [
                        {
                            uri,
                            mimeType: 'application/json',
                            text: JSON.stringify(
                                {
                                    profiles: ['Default', 'Project Default', 'Strict', 'Essential'],
                                    description: 'Available inspection profiles for code analysis',
                                },
                                null,
                                2,
                            ),
                        },
                    ],
                };
            }

            if (uri === 'inspection://config') {
                const config = this.container.resolve<ConfigLoader>('ConfigLoader').getConfig();
                return {
                    contents: [
                        {
                            uri,
                            mimeType: 'application/json',
                            text: JSON.stringify(config, null, 2),
                        },
                    ],
                };
            }

            if (uri === 'inspection://ides') {
                const { IDEDetector } = await import('../../core/ide/IDEDetector.js');
                const { getIDEPaths } = await import('../../infrastructure/config/IDEPaths.js');
                const detector = new IDEDetector(getIDEPaths(), this.logger);
                const ides = await detector.findAvailableIDEs();

                return {
                    contents: [
                        {
                            uri,
                            mimeType: 'application/json',
                            text: JSON.stringify(
                                {
                                    detected: ides,
                                    count: ides.length,
                                },
                                null,
                                2,
                            ),
                        },
                    ],
                };
            }

            throw new Error(`Unknown resource: ${uri}`);
        });
    }
}
