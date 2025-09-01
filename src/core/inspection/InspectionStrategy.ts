import { spawn } from 'child_process';
import * as path from 'path';
import { IInspectionStrategy, InspectionContext, InspectionParams } from '../../domain/interfaces/IInspector.js';
import { IDEExecutionError, InspectionTimeoutError } from '../../domain/errors/index.js';
import { TempManager } from '../../infrastructure/filesystem/TempManager.js';
import { ProjectScanner } from '../../infrastructure/filesystem/ProjectScanner.js';
import { IDESelector } from '../ide/IDESelector.js';
import { Logger } from '../../shared/logger/Logger.js';

/**
 * Strategy for executing JetBrains inspections
 */
export class InspectionStrategy implements IInspectionStrategy {
    constructor(
        private readonly ideSelector: IDESelector,
        private readonly projectScanner: ProjectScanner,
        private readonly tempManager: TempManager,
        private readonly logger: Logger,
    ) {}

    async prepare(params: InspectionParams): Promise<InspectionContext> {
        // Find project root
        const projectRoot = params.projectRoot || (await this.projectScanner.findProjectRoot(params.targetPath));

        if (!projectRoot) {
            throw new Error('Could not find project root with .idea directory');
        }

        // Select appropriate IDE
        const ide = await this.ideSelector.selectForPath(params.targetPath, projectRoot);
        if (!ide) {
            throw new Error('No suitable JetBrains IDE found');
        }

        // Create output directory
        const outputDir = await this.tempManager.createTempDir('inspection-');

        return {
            targetPath: path.resolve(params.targetPath),
            projectRoot: path.resolve(projectRoot),
            profilePath: params.profilePath ? path.resolve(params.profilePath) : null,
            outputDir,
            ideePath: ide.path,
            ideName: ide.name,
            timeout: params.timeout || 120000,
        };
    }

    async execute(context: InspectionContext): Promise<string> {
        const { configPath, systemPath } = await this.createIsolatedDirs();

        try {
            const args = this.buildInspectionArgs(context, configPath, systemPath);
            await this.runInspection(context, args);
            return context.outputDir;
        } finally {
            await this.cleanupIsolatedDirs(configPath, systemPath);
        }
    }

    async cleanup(context: InspectionContext): Promise<void> {
        await this.tempManager.cleanup(context.outputDir);
    }

    private async createIsolatedDirs(): Promise<{ configPath: string; systemPath: string }> {
        const configPath = await this.tempManager.createTempDir('config-');
        const systemPath = await this.tempManager.createTempDir('system-');
        return { configPath, systemPath };
    }

    private async cleanupIsolatedDirs(configPath: string, systemPath: string): Promise<void> {
        await this.tempManager.cleanup(configPath);
        await this.tempManager.cleanup(systemPath);
    }

    private buildInspectionArgs(context: InspectionContext, configPath: string, systemPath: string): string[] {
        const args = [
            `-Didea.config.path=${configPath}`,
            `-Didea.system.path=${systemPath}`,
            context.projectRoot,
            context.profilePath || context.projectRoot, // mandatory 2nd parameter
            context.outputDir, // mandatory 3rd parameter
        ];

        // If no profile specified, add -e flag AFTER the 3 mandatory parameters
        if (!context.profilePath) {
            args.push('-e');
        }

        args.push('-format', 'json', '-v2', '-d', context.targetPath);

        return args;
    }

    private runInspection(context: InspectionContext, args: string[]): Promise<void> {
        return new Promise((resolve, reject) => {
            const quotedArgs = args.map((arg) => '"' + arg + '"').join(' ');
            const shellCommand = `"${context.ideePath}" ${quotedArgs} 2>/dev/null`;

            this.logger.info(`Running inspection command:\n${shellCommand}`);

            const inspect = spawn('sh', ['-c', shellCommand], {
                cwd: context.projectRoot,
                shell: false,
            });

            const timeoutId = setTimeout(() => {
                inspect.kill('SIGTERM');
                reject(new InspectionTimeoutError(context.timeout));
            }, context.timeout);

            let _stdoutBuffer = '';
            let _stderrBuffer = '';

            inspect.stdout.on('data', (data: Buffer) => {
                _stdoutBuffer += data.toString();
            });

            inspect.stderr.on('data', (data: Buffer) => {
                _stderrBuffer += data.toString();
            });

            inspect.on('error', (error: Error) => {
                clearTimeout(timeoutId);
                reject(error);
            });

            inspect.on('close', (code: number | null) => {
                clearTimeout(timeoutId);

                if (code !== 0 && code !== null) {
                    reject(new IDEExecutionError(`JetBrains IDE inspect exited with code ${code}`, code));
                } else {
                    resolve();
                }
            });
        });
    }
}
