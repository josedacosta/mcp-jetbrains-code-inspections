import * as fs from 'fs/promises';
import * as path from 'path';
import { Logger } from '../../shared/logger/Logger.js';

/**
 * Configuration management
 */
export interface ServerConfig {
    name: string;
    version: string;
    defaultTimeout: number;
    debug: boolean;
    customIDEPath?: string;
    defaultExclude?: string[];
    defaultOnly?: string[];
    responseFormat: 'markdown' | 'json';
    cache?: {
        enabled: boolean;
        ttl: number;
        maxSize: number;
    };
}

export class ConfigLoader {
    private static instance: ConfigLoader;
    private config: ServerConfig | null = null;
    private readonly logger = new Logger('ConfigLoader');

    private constructor() {}

    static getInstance(): ConfigLoader {
        if (!ConfigLoader.instance) {
            ConfigLoader.instance = new ConfigLoader();
        }
        return ConfigLoader.instance;
    }

    /**
     * Load configuration from various sources
     */
    async load(): Promise<ServerConfig> {
        if (this.config) {
            return this.config;
        }

        const defaultConfig = this.getDefaultConfig();
        const envConfig = this.loadFromEnvironment();
        const fileConfig = await this.loadFromFile();

        this.config = this.mergeConfigs(defaultConfig, fileConfig, envConfig);

        this.logger.info('Configuration loaded', {
            source: fileConfig ? 'file + env' : 'env',
        });

        return this.config;
    }

    /**
     * Get current configuration
     */
    getConfig(): ServerConfig {
        if (!this.config) {
            throw new Error('Configuration not loaded. Call load() first.');
        }
        return this.config;
    }

    private getDefaultConfig(): ServerConfig {
        return {
            name: 'mcp-jetbrains-code-inspections',
            version: '2.0.0',
            defaultTimeout: 120000,
            debug: false,
            responseFormat: 'markdown',
            defaultExclude: ['SpellCheckingInspection'],
            cache: {
                enabled: true,
                ttl: 3600000, // 1 hour
                maxSize: 100,
            },
        };
    }

    private loadFromEnvironment(): Partial<ServerConfig> {
        const config: Partial<ServerConfig> = {};

        // FORCE_* variables (disable auto-detection)
        if (process.env.FORCE_INSPECT_PATH) {
            config.customIDEPath = process.env.FORCE_INSPECT_PATH;
        }

        // Inspection configuration
        if (process.env.INSPECTION_TIMEOUT) {
            config.defaultTimeout = parseInt(process.env.INSPECTION_TIMEOUT, 10);
        }

        if (process.env.EXCLUDE_INSPECTIONS) {
            config.defaultExclude = this.parseList(process.env.EXCLUDE_INSPECTIONS);
        }

        if (process.env.ONLY_INSPECTIONS) {
            config.defaultOnly = this.parseList(process.env.ONLY_INSPECTIONS);
        }

        // Output and debug
        if (process.env.RESPONSE_FORMAT) {
            config.responseFormat = process.env.RESPONSE_FORMAT as 'markdown' | 'json';
        }

        if (process.env.DEBUG === 'true') {
            config.debug = true;
        }

        return config;
    }

    private async loadFromFile(): Promise<Partial<ServerConfig> | null> {
        const configPaths = ['.mcp-jetbrains.json', '.mcp-jetbrains.config.json', 'mcp-jetbrains.config.json'];

        for (const configPath of configPaths) {
            try {
                const fullPath = path.resolve(process.cwd(), configPath);
                const content = await fs.readFile(fullPath, 'utf-8');
                const config = JSON.parse(content);

                this.logger.info(`Loaded configuration from ${configPath}`);
                return config;
            } catch {
                // File doesn't exist or is invalid, try next
            }
        }

        return null;
    }

    private mergeConfigs(...configs: Array<Partial<ServerConfig> | null>): ServerConfig {
        const merged = {} as ServerConfig;

        for (const config of configs) {
            if (!config) continue;

            Object.assign(merged, config);

            // Deep merge cache config
            if (config.cache) {
                merged.cache = {
                    ...merged.cache,
                    ...config.cache,
                };
            }
        }

        return merged;
    }

    private parseList(value: string): string[] {
        return value
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
    }
}
