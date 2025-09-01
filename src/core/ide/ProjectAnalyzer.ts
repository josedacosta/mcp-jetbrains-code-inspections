import * as path from 'path';
import * as fs from 'fs/promises';
import { existsSync } from 'fs';
import { Logger } from '../../shared/logger/Logger.js';

/**
 * Analyzes project structure to determine project type
 */
export class ProjectAnalyzer {
    private static readonly PROJECT_INDICATORS: Record<string, string[]> = {
        node: ['package.json', 'node_modules', 'tsconfig.json', 'jsconfig.json'],
        python: ['requirements.txt', 'setup.py', 'pyproject.toml', 'Pipfile'],
        java: ['pom.xml', 'build.gradle', 'build.gradle.kts', '.mvn'],
        php: ['composer.json', 'composer.lock', 'vendor'],
        go: ['go.mod', 'go.sum'],
        dotnet: ['*.csproj', '*.sln', '*.fsproj', 'global.json'],
        cpp: ['CMakeLists.txt', 'Makefile', 'conanfile.txt', 'vcpkg.json'],
        ruby: ['Gemfile', 'Gemfile.lock', 'Rakefile', '.bundle'],
        rust: ['Cargo.toml', 'Cargo.lock'],
        ios: ['Package.swift', '*.xcodeproj', '*.xcworkspace', 'Podfile'],
    };

    constructor(private readonly logger: Logger) {}

    /**
     * Analyze project to determine its type
     */
    async analyzeProject(projectRoot: string): Promise<string | null> {
        this.logger.debug(`Analyzing project at ${projectRoot}`);

        for (const [projectType, indicators] of Object.entries(ProjectAnalyzer.PROJECT_INDICATORS)) {
            if (await this.hasIndicators(projectRoot, indicators)) {
                this.logger.debug(`Detected project type: ${projectType}`);
                return projectType;
            }
        }

        // Try to detect by file extensions in the project
        const primaryLanguage = await this.detectPrimaryLanguage(projectRoot);
        if (primaryLanguage) {
            this.logger.debug(`Detected primary language: ${primaryLanguage}`);
            return primaryLanguage;
        }

        this.logger.debug('Could not determine project type');
        return null;
    }

    /**
     * Analyze file to determine its language
     */
    async analyzeFile(filePath: string): Promise<string | null> {
        const ext = path.extname(filePath).toLowerCase();

        const extensionMap: Record<string, string> = {
            '.js': 'javascript',
            '.jsx': 'javascript',
            '.ts': 'typescript',
            '.tsx': 'typescript',
            '.py': 'python',
            '.java': 'java',
            '.kt': 'kotlin',
            '.php': 'php',
            '.go': 'go',
            '.cs': 'csharp',
            '.cpp': 'cpp',
            '.c': 'c',
            '.rb': 'ruby',
            '.rs': 'rust',
            '.swift': 'swift',
            '.m': 'objc',
            '.sql': 'sql',
        };

        return extensionMap[ext] || null;
    }

    private async hasIndicators(projectRoot: string, indicators: string[]): Promise<boolean> {
        for (const indicator of indicators) {
            if (indicator.includes('*')) {
                // Handle glob patterns
                const pattern = indicator.replace('*', '');
                try {
                    const entries = await fs.readdir(projectRoot);
                    const hasMatch = entries.some((entry) => entry.includes(pattern) || entry.endsWith(pattern.replace('.', '')));
                    if (hasMatch) return true;
                } catch {
                    // Directory might not exist
                }
            } else {
                // Check for specific file
                const filePath = path.join(projectRoot, indicator);
                if (existsSync(filePath)) {
                    return true;
                }
            }
        }
        return false;
    }

    private async detectPrimaryLanguage(projectRoot: string): Promise<string | null> {
        const languageCount = new Map<string, number>();

        try {
            await this.countLanguagesInDir(projectRoot, languageCount, 0, 2);

            if (languageCount.size === 0) {
                return null;
            }

            // Find the most common language
            let maxCount = 0;
            let primaryLanguage = null;

            for (const [language, count] of languageCount) {
                if (count > maxCount) {
                    maxCount = count;
                    primaryLanguage = language;
                }
            }

            return primaryLanguage;
        } catch {
            return null;
        }
    }

    private async countLanguagesInDir(dirPath: string, languageCount: Map<string, number>, depth: number, maxDepth: number): Promise<void> {
        if (depth > maxDepth) return;

        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });

            for (const entry of entries) {
                if (entry.name.startsWith('.') || entry.name === 'node_modules') {
                    continue;
                }

                const fullPath = path.join(dirPath, entry.name);

                if (entry.isFile()) {
                    const language = await this.analyzeFile(fullPath);
                    if (language) {
                        languageCount.set(language, (languageCount.get(language) || 0) + 1);
                    }
                } else if (entry.isDirectory() && depth < maxDepth) {
                    await this.countLanguagesInDir(fullPath, languageCount, depth + 1, maxDepth);
                }
            }
        } catch {
            // Ignore errors reading directories
        }
    }
}
