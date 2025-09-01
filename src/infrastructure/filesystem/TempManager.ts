import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { Logger } from '../../shared/logger/Logger.js';

/**
 * Manages temporary directories and files
 */
export class TempManager {
    private static readonly TEMP_PREFIX = 'jetbrains-inspect-';
    private readonly tempDirs: Set<string> = new Set();

    constructor(private readonly logger: Logger) {}

    /**
     * Clean up old temporary directories from previous runs
     */
    static async cleanupOldDirs(maxAgeMs: number = 24 * 60 * 60 * 1000): Promise<void> {
        const logger = new Logger('TempManager');

        try {
            const tempRoot = os.tmpdir();
            const entries = await fs.readdir(tempRoot);
            const now = Date.now();
            let cleanedCount = 0;

            for (const entry of entries) {
                if (!entry.startsWith(TempManager.TEMP_PREFIX)) {
                    continue;
                }

                const fullPath = path.join(tempRoot, entry);

                try {
                    const stats = await fs.stat(fullPath);

                    if (stats.isDirectory() && now - stats.mtimeMs > maxAgeMs) {
                        await fs.rm(fullPath, { recursive: true, force: true });
                        cleanedCount++;
                        logger.debug(`Cleaned up old temp directory: ${fullPath}`);
                    }
                } catch {
                    // Ignore errors for individual directories
                }
            }

            if (cleanedCount > 0) {
                logger.info(`Cleaned up ${cleanedCount} old temp directories`);
            }
        } catch (error) {
            logger.warn('Failed to cleanup old temp directories:', error);
        }
    }

    /**
     * Create a temporary directory
     */
    async createTempDir(prefix: string = ''): Promise<string> {
        const tempRoot = os.tmpdir();
        const dirName = `${TempManager.TEMP_PREFIX}${prefix}${Date.now()}`;
        const tempDir = path.join(tempRoot, dirName);

        await fs.mkdir(tempDir, { recursive: true });
        this.tempDirs.add(tempDir);

        this.logger.debug(`Created temp directory: ${tempDir}`);
        return tempDir;
    }

    /**
     * Clean up a specific directory
     */
    async cleanup(dirPath: string): Promise<void> {
        if (!this.tempDirs.has(dirPath)) {
            return;
        }

        // Save output directory if MCP_DEBUG_OUTPUT_DIR is set
        const debugOutputDir = process.env.MCP_DEBUG_OUTPUT_DIR;
        if (debugOutputDir) {
            try {
                const outputCopyDir = path.join(debugOutputDir, 'inspect-output');
                await this.copyDirectory(dirPath, outputCopyDir);
                this.logger.debug(`Saved inspection output to: ${outputCopyDir}`);
            } catch (error) {
                this.logger.warn('Failed to save inspection output:', error);
            }
        }

        try {
            await fs.rm(dirPath, { recursive: true, force: true });
            this.tempDirs.delete(dirPath);
            this.logger.debug(`Cleaned up temp directory: ${dirPath}`);
        } catch (error) {
            this.logger.warn(`Failed to cleanup temp directory ${dirPath}:`, error);
        }
    }

    /**
     * Clean up all tracked temporary directories
     */
    async cleanupAll(): Promise<void> {
        const cleanupPromises = Array.from(this.tempDirs).map((dir) => this.cleanup(dir));

        await Promise.allSettled(cleanupPromises);
        this.logger.info(`Cleaned up ${cleanupPromises.length} temp directories`);
    }

    /**
     * Copy directory recursively
     */
    private async copyDirectory(src: string, dest: string): Promise<void> {
        await fs.mkdir(dest, { recursive: true });
        const entries = await fs.readdir(src, { withFileTypes: true });

        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);

            if (entry.isDirectory()) {
                await this.copyDirectory(srcPath, destPath);
            } else {
                await fs.copyFile(srcPath, destPath);
            }
        }
    }
}
