import * as path from 'path';
import { IDE, IDE_CAPABILITIES, IDEType } from '../../domain/models/IDE.js';
import { IDEDetector } from './IDEDetector.js';
import { ProjectAnalyzer } from './ProjectAnalyzer.js';
import { Logger } from '../../shared/logger/Logger.js';

/**
 * Selects the most appropriate IDE for a given context
 */
export class IDESelector {
    constructor(
        private readonly detector: IDEDetector,
        private readonly projectAnalyzer: ProjectAnalyzer,
        private readonly logger: Logger,
    ) {}

    /**
     * Select the best IDE for a given path
     */
    async selectForPath(targetPath: string, projectRoot: string): Promise<IDE | null> {
        const availableIDEs = await this.detector.findAvailableIDEs();

        if (availableIDEs.length === 0) {
            this.logger.warn('No JetBrains IDEs found');
            return null;
        }

        // Analyze the target to determine best IDE
        const fileExtension = path.extname(targetPath).toLowerCase();
        const projectType = await this.projectAnalyzer.analyzeProject(projectRoot);

        // Score each IDE based on compatibility
        const scoredIDEs = availableIDEs.map((ide) => ({
            ide,
            score: this.calculateScore(ide, fileExtension, projectType),
        }));

        // Sort by score (highest first)
        scoredIDEs.sort((a, b) => b.score - a.score);

        const selected = scoredIDEs[0].ide;
        this.logger.info(`Selected IDE: ${selected.name} (score: ${scoredIDEs[0].score})`);

        return selected;
    }

    private calculateScore(ide: IDE, fileExtension: string, projectType: string | null): number {
        let score = 0;
        const capabilities = IDE_CAPABILITIES[ide.type];

        if (!capabilities) {
            return score;
        }

        // Base priority score
        score += capabilities.priority * 10;

        // File extension compatibility
        if (capabilities.supportedFileExtensions.includes(fileExtension)) {
            score += 50;
        }

        // Project type compatibility
        if (projectType) {
            score += this.getProjectTypeScore(ide.type, projectType);
        }

        // Prefer Ultimate/Professional editions
        if (ide.name.includes('Ultimate') || ide.name.includes('Professional')) {
            score += 5;
        }

        return score;
    }

    private getProjectTypeScore(ideType: IDEType, projectType: string): number {
        const projectScores: Record<string, Partial<Record<IDEType, number>>> = {
            node: {
                [IDEType.WEBSTORM]: 30,
                [IDEType.INTELLIJ_IDEA]: 20,
            },
            python: {
                [IDEType.PYCHARM]: 30,
                [IDEType.DATASPELL]: 25,
                [IDEType.INTELLIJ_IDEA]: 15,
            },
            java: {
                [IDEType.INTELLIJ_IDEA]: 30,
            },
            php: {
                [IDEType.PHPSTORM]: 30,
                [IDEType.INTELLIJ_IDEA]: 15,
            },
            go: {
                [IDEType.GOLAND]: 30,
                [IDEType.INTELLIJ_IDEA]: 15,
            },
            dotnet: {
                [IDEType.RIDER]: 30,
                [IDEType.INTELLIJ_IDEA]: 10,
            },
            cpp: {
                [IDEType.CLION]: 30,
                [IDEType.INTELLIJ_IDEA]: 10,
            },
            ruby: {
                [IDEType.RUBYMINE]: 30,
                [IDEType.INTELLIJ_IDEA]: 10,
            },
            rust: {
                [IDEType.RUSTROVER]: 25,
                [IDEType.CLION]: 20,
                [IDEType.INTELLIJ_IDEA]: 10,
            },
            ios: {
                [IDEType.APPCODE]: 30,
                [IDEType.CLION]: 15,
            },
        };

        return projectScores[projectType]?.[ideType] || 0;
    }
}
