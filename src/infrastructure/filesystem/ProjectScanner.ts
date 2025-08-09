import * as path from 'path';
import * as fs from 'fs/promises';
import { Logger } from '../../shared/logger/Logger.js';

/**
 * Scans and analyzes project structure
 */
export class ProjectScanner {
    private static readonly PROJECT_MARKERS = [
        '.idea',
        '.git',
        '.vscode',
        'package.json',
        'pom.xml',
        'build.gradle',
        'Cargo.toml',
        'go.mod',
        'composer.json',
        'Gemfile',
    ];

    constructor(private readonly logger: Logger) {}

    /**
     * Find project root by searching for markers
     */
    async findProjectRoot(startPath: string): Promise<string | null> {
        try {
            const stats = await fs.stat(startPath);
            let currentDir = stats.isDirectory() ? startPath : path.dirname(startPath);

            // Search upwards for project markers
            while (currentDir !== path.dirname(currentDir)) {
                // Check for .idea first (JetBrains project)
                if (await this.hasMarker(currentDir, '.idea')) {
                    this.logger.debug(`Found project root with .idea at: ${currentDir}`);
                    return currentDir;
                }

                // Check for other markers
                for (const marker of ProjectScanner.PROJECT_MARKERS) {
                    if (await this.hasMarker(currentDir, marker)) {
                        this.logger.debug(`Found project root with ${marker} at: ${currentDir}`);
                        return currentDir;
                    }
                }

                currentDir = path.dirname(currentDir);
            }

            // Check root directory as well
            if (await this.hasMarker(currentDir, '.idea')) {
                return currentDir;
            }
        } catch (error) {
            this.logger.error('Error finding project root:', error);
        }

        return null;
    }

    private async hasMarker(dirPath: string, marker: string): Promise<boolean> {
        try {
            const markerPath = path.join(dirPath, marker);
            await fs.access(markerPath, fs.constants.R_OK);
            return true;
        } catch {
            return false;
        }
    }
}
