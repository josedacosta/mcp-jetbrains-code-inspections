import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { RequestHandlers } from './RequestHandlers.js';
import { ServerConfig } from '../../infrastructure/config/ConfigLoader.js';
import { TempManager } from '../../infrastructure/filesystem/TempManager.js';
import { Logger } from '../../shared/logger/Logger.js';
import { DependencyContainer } from '../../core/DependencyContainer.js';

/**
 * Main MCP Server implementation
 */
export class MCPServer {
    private readonly server: Server;
    private requestHandlers: RequestHandlers;
    private readonly logger = new Logger('MCPServer');

    constructor(
        private readonly config: ServerConfig,
        private readonly container: DependencyContainer,
    ) {
        this.server = new Server(
            {
                name: config.name,
                version: config.version,
            },
            {
                capabilities: {
                    tools: {
                        listChanged: true,
                    },
                },
            },
        );

        this.requestHandlers = new RequestHandlers(this.server, container);
    }

    /**
     * Start the MCP server
     */
    async start(): Promise<void> {
        try {
            // Clean up old temporary directories
            await TempManager.cleanupOldDirs();

            // Setup request handlers
            this.requestHandlers.setup();

            // Start the server
            const transport = new StdioServerTransport();
            await this.server.connect(transport);

            this.logger.info('MCP JetBrains Code Inspections started', {
                name: this.config.name,
                version: this.config.version,
                timeout: this.config.defaultTimeout,
            });

            // Setup graceful shutdown
            this.setupGracefulShutdown();
        } catch (error) {
            this.logger.error('Failed to start server:', error);
            throw error;
        }
    }

    /**
     * Stop the MCP server
     */
    async stop(): Promise<void> {
        try {
            // Cleanup resources
            const tempManager = this.container.resolve<TempManager>('TempManager');
            await tempManager.cleanupAll();

            // Close server
            await this.server.close();

            this.logger.info('Server stopped successfully');
        } catch (error) {
            this.logger.error('Error during shutdown:', error);
            throw error;
        }
    }

    private setupGracefulShutdown(): void {
        const shutdown = async (signal: string) => {
            this.logger.info(`Received ${signal}, shutting down gracefully...`);

            try {
                await this.stop();
                process.exit(0);
            } catch (error) {
                this.logger.error('Error during shutdown:', error);
                process.exit(1);
            }
        };

        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('uncaughtException', (error) => {
            this.logger.error('Uncaught exception:', error);
            void shutdown('uncaughtException');
        });
        process.on('unhandledRejection', (reason) => {
            this.logger.error('Unhandled rejection:', reason);
            void shutdown('unhandledRejection');
        });
    }
}
