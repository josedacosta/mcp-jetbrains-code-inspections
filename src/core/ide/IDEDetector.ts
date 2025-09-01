import * as os from 'os';
import { existsSync } from 'fs';
import { execSync } from 'child_process';
import { glob } from 'glob';
import { IDE, IDEPathConfig, IDEType } from '../../domain/models/IDE.js';
import { IDENotFoundError } from '../../domain/errors/index.js';
import { IDEPathResolver } from './IDEPathResolver.js';
import { Logger } from '../../shared/logger/Logger.js';

/**
 * Detects installed JetBrains IDEs on the system
 */
export class IDEDetector {
    private static readonly SUPPORTED_PLATFORMS = ['darwin', 'linux', 'win32'] as const;
    private readonly platform: NodeJS.Platform;
    private readonly pathResolver: IDEPathResolver;

    constructor(
        private readonly idePaths: IDEPathConfig,
        private readonly logger: Logger,
    ) {
        this.platform = os.platform();
        this.pathResolver = new IDEPathResolver();

        if (!this.isSupported()) {
            throw new IDENotFoundError(`Unsupported platform: ${this.platform}. Supported: ${IDEDetector.SUPPORTED_PLATFORMS.join(', ')}`);
        }
    }

    /**
     * Find all available JetBrains IDEs
     */
    async findAvailableIDEs(): Promise<IDE[]> {
        const platform = this.platform as keyof IDEPathConfig;
        const paths = this.idePaths[platform] || [];
        const results: IDE[] = [];
        const checkedIDEs = new Set<string>();

        this.logger.debug(`Checking ${paths.length} potential IDE paths on ${platform}`);

        const expandedPaths = await this.expandAndCheckPaths(paths);

        for (const expandedPath of expandedPaths) {
            const ideName = this.extractIDEName(expandedPath);

            if (checkedIDEs.has(ideName)) {
                continue;
            }

            checkedIDEs.add(ideName);

            const ide: IDE = {
                type: this.mapNameToType(ideName),
                name: ideName,
                path: expandedPath,
                version: await this.getIDEVersion(expandedPath),
                isRunning: false,
            };

            results.push(ide);
            this.logger.debug(`Found IDE: ${ideName} at ${expandedPath}`);
        }

        this.logger.info(`Found ${results.length} JetBrains IDEs`);
        return results;
    }

    private async expandAndCheckPaths(paths: string[]): Promise<string[]> {
        const validPaths: string[] = [];

        for (const pathPattern of paths) {
            const expanded = this.pathResolver.expandPath(pathPattern);

            if (pathPattern.includes('*')) {
                try {
                    const matches = await glob(expanded, {
                        nodir: true,
                        ignore: ['**/node_modules/**'],
                    });
                    validPaths.push(...matches.filter((m) => existsSync(m)));
                } catch {
                    // Ignore glob errors
                }
            } else if (existsSync(expanded)) {
                validPaths.push(expanded);
            }
        }

        return validPaths;
    }

    private extractIDEName(path: string): string {
        // Check for specific editions first
        const patterns: [RegExp, string][] = [
            [/IntelliJ IDEA CE/i, 'IntelliJ IDEA CE'],
            [/IntelliJ IDEA Ultimate/i, 'IntelliJ IDEA Ultimate'],
            [/IntelliJ IDEA/i, 'IntelliJ IDEA'],
            [/PyCharm CE/i, 'PyCharm CE'],
            [/PyCharm Professional/i, 'PyCharm Professional'],
            [/PyCharm/i, 'PyCharm'],
            [/WebStorm/i, 'WebStorm'],
            [/PhpStorm/i, 'PhpStorm'],
            [/GoLand/i, 'GoLand'],
            [/Rider/i, 'Rider'],
            [/CLion/i, 'CLion'],
            [/RubyMine/i, 'RubyMine'],
            [/DataGrip/i, 'DataGrip'],
            [/DataSpell/i, 'DataSpell'],
            [/AppCode/i, 'AppCode'],
            [/Android Studio/i, 'Android Studio'],
            [/RustRover/i, 'RustRover'],
            [/Aqua/i, 'Aqua'],
            [/Writerside/i, 'Writerside'],
        ];

        for (const [pattern, name] of patterns) {
            if (pattern.exec(path)) {
                return name;
            }
        }

        return 'Unknown IDE';
    }

    private mapNameToType(name: string): IDEType {
        const mapping: Record<string, IDEType> = {
            'IntelliJ IDEA': IDEType.INTELLIJ_IDEA,
            'IntelliJ IDEA CE': IDEType.INTELLIJ_IDEA,
            'IntelliJ IDEA Ultimate': IDEType.INTELLIJ_IDEA,
            WebStorm: IDEType.WEBSTORM,
            PyCharm: IDEType.PYCHARM,
            'PyCharm CE': IDEType.PYCHARM,
            'PyCharm Professional': IDEType.PYCHARM,
            PhpStorm: IDEType.PHPSTORM,
            GoLand: IDEType.GOLAND,
            Rider: IDEType.RIDER,
            CLion: IDEType.CLION,
            RubyMine: IDEType.RUBYMINE,
            DataGrip: IDEType.DATAGRIP,
            DataSpell: IDEType.DATASPELL,
            AppCode: IDEType.APPCODE,
            'Android Studio': IDEType.ANDROID_STUDIO,
            RustRover: IDEType.RUSTROVER,
            Aqua: IDEType.AQUA,
            Writerside: IDEType.WRITERSIDE,
        };

        return mapping[name] || IDEType.INTELLIJ_IDEA;
    }

    private async getIDEVersion(inspectPath: string): Promise<string | undefined> {
        try {
            const output = execSync(`"${inspectPath}" --version`, {
                encoding: 'utf-8',
                timeout: 5000,
            });

            const versionMatch = /\d+\.\d+(\.\d+)?/.exec(output);
            return versionMatch ? versionMatch[0] : undefined;
        } catch {
            return undefined;
        }
    }

    private isSupported(): boolean {
        return IDEDetector.SUPPORTED_PLATFORMS.includes(this.platform as (typeof IDEDetector.SUPPORTED_PLATFORMS)[number]);
    }
}
