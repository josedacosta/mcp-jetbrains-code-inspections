import { DependencyContainer } from './core/DependencyContainer.js';
import { MCPServer } from './mcp/server/MCPServer.js';
import { ConfigLoader } from './infrastructure/config/ConfigLoader.js';
import { Logger } from './shared/logger/Logger.js';

// Core services
import { InspectionExecutor } from './core/inspection/InspectionExecutor.js';
import { InspectionStrategy } from './core/inspection/InspectionStrategy.js';
import { InspectionResultProcessor } from './core/inspection/InspectionResultProcessor.js';

// IDE services
import { IDEDetector } from './core/ide/IDEDetector.js';
import { IDESelector } from './core/ide/IDESelector.js';
import { ProjectAnalyzer } from './core/ide/ProjectAnalyzer.js';

// Parsing services
import { ResultParser } from './core/parsing/ResultParser.js';
import { SeverityMapper } from './core/parsing/SeverityMapper.js';
import { DiagnosticNormalizer } from './core/parsing/DiagnosticNormalizer.js';
import { DiagnosticFilter } from './core/parsing/DiagnosticFilter.js';

// Infrastructure services
import { TempManager } from './infrastructure/filesystem/TempManager.js';
import { ProjectScanner } from './infrastructure/filesystem/ProjectScanner.js';
import { getIDEPaths } from './infrastructure/config/IDEPaths.js';

// MCP services
import { InspectionTool } from './mcp/tools/InspectionTool.js';
import { MarkdownFormatter } from './mcp/formatters/MarkdownFormatter.js';
import { JSONFormatter } from './mcp/formatters/JSONFormatter.js';

/**
 * Application main class with dependency injection
 */
export class Application {
    private readonly container: DependencyContainer;
    private server: MCPServer | null = null;
    private readonly logger = new Logger('Application');

    constructor() {
        this.container = new DependencyContainer();
    }

    /**
     * Start the application
     */
    async start(): Promise<void> {
        this.logger.info('Starting application...');

        // Setup dependencies
        await this.setupDependencies();

        // Create and start server
        const config = this.container.resolve<ConfigLoader>('ConfigLoader');
        const serverConfig = await config.load();

        this.server = new MCPServer(serverConfig, this.container);
        await this.server.start();

        this.logger.info('Application started successfully');
    }

    private async setupDependencies(): Promise<void> {
        // Configuration
        this.container.registerValue('ConfigLoader', ConfigLoader.getInstance());

        // Shared services
        this.container.register('Logger', () => new Logger('App'));

        // Infrastructure services
        this.container.register('TempManager', () => new TempManager(this.container.resolve('Logger')));

        this.container.register('ProjectScanner', () => new ProjectScanner(this.container.resolve('Logger')));

        // IDE services
        this.container.register('IDEPaths', () => getIDEPaths());

        this.container.register('IDEDetector', () => new IDEDetector(this.container.resolve('IDEPaths'), this.container.resolve('Logger')));

        this.container.register('ProjectAnalyzer', () => new ProjectAnalyzer(this.container.resolve('Logger')));

        this.container.register(
            'IDESelector',
            () => new IDESelector(this.container.resolve('IDEDetector'), this.container.resolve('ProjectAnalyzer'), this.container.resolve('Logger')),
        );

        // Parsing services
        this.container.register('SeverityMapper', () => new SeverityMapper());
        this.container.register('DiagnosticNormalizer', () => new DiagnosticNormalizer());

        this.container.register('DiagnosticFilter', () => new DiagnosticFilter(this.container.resolve('Logger')));

        this.container.register(
            'ResultParser',
            () =>
                new ResultParser(
                    this.container.resolve('SeverityMapper'),
                    this.container.resolve('DiagnosticNormalizer'),
                    this.container.resolve('Logger'),
                ),
        );

        // Inspection services
        this.container.register(
            'InspectionResultProcessor',
            () =>
                new InspectionResultProcessor(
                    this.container.resolve('ResultParser'),
                    this.container.resolve('DiagnosticFilter'),
                    this.container.resolve('Logger'),
                ),
        );

        this.container.register(
            'InspectionStrategy',
            () =>
                new InspectionStrategy(
                    this.container.resolve('IDESelector'),
                    this.container.resolve('ProjectScanner'),
                    this.container.resolve('TempManager'),
                    this.container.resolve('Logger'),
                ),
        );

        this.container.register(
            'InspectionExecutor',
            () =>
                new InspectionExecutor(
                    this.container.resolve('InspectionStrategy'),
                    this.container.resolve('InspectionResultProcessor'),
                    this.container.resolve('Logger'),
                ),
        );

        // MCP services
        this.container.register(
            'InspectionTool',
            () => new InspectionTool(this.container.resolve('InspectionExecutor'), this.container.resolve('Logger')),
        );

        this.container.register('MarkdownFormatter', () => new MarkdownFormatter());
        this.container.register('JSONFormatter', () => new JSONFormatter());

        this.logger.info('Dependencies setup complete');
    }
}
