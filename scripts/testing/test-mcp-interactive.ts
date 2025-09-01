#!/usr/bin/env tsx

import { ChildProcess, spawn } from 'child_process';
import * as readline from 'readline';
import * as path from 'path';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';

// Get the directory of the current script
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Logger for test scripts - allows console usage in test scripts
/* eslint-disable no-console */
const logger = {
    log: (...args: unknown[]) => {
        console.log(...args);
    },
    error: (...args: unknown[]) => {
        console.error(...args);
    },
    warn: (...args: unknown[]) => {
        console.warn(...args);
    },
};
/* eslint-enable no-console */

// Terminal color codes
const colors = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    italic: '\x1b[3m',
    underline: '\x1b[4m',

    // Foreground colors
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m',

    // Bright colors
    brightRed: '\x1b[91m',
    brightGreen: '\x1b[92m',
    brightYellow: '\x1b[93m',
    brightBlue: '\x1b[94m',
    brightMagenta: '\x1b[95m',
    brightCyan: '\x1b[96m',
    brightWhite: '\x1b[97m',

    // Background colors
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
};

// Helper function to colorize text
const colorize = (text: string, ...colorCodes: string[]): string => {
    return colorCodes.join('') + text + colors.reset;
};

interface TestOptions {
    path: string;
    timeout?: number;
    useCompiled?: boolean;
    interactive?: boolean;
    saveInspectionLogs?: boolean;
    verboseDebug?: boolean;
    // Note: exclude and include are now configured via environment variables only
}

interface MCPResponse {
    id?: number;
    result?: {
        content?: Array<{
            type: string;
            text: string;
        }>;
    };
    error?: unknown;
}

interface InspectionDiagnostic {
    severity?: string;
    message: string;
    file?: string;
    range?: {
        start: {
            line: number;
            character: number;
        };
    };
    code?: string;
}

interface InspectionResult {
    error?: string;
    errorCode?: string;
    diagnostics?: InspectionDiagnostic[];
    totalProblems?: number;
}

interface MCPRequest {
    jsonrpc: string;
    id: number;
    method: string;
    params: Record<string, unknown>;
}

class MCPServerTester {
    private serverProcess: ChildProcess | null = null;
    private rl: readline.Interface;
    private messageId = 0;
    private options: TestOptions;
    private lastInspectionResult: InspectionResult | null = null;
    private readonly logFilePath: string;
    private readonly mcpResponsePath: string;
    private inspectionLogStream: string[] = [];

    constructor(options: TestOptions) {
        this.options = options;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        // Set output file paths
        const outputDir = path.join(__dirname, 'test-mcp-interactive');
        this.mcpResponsePath = path.join(outputDir, 'mcp-response');
        this.logFilePath = path.join(outputDir, 'inspection-logs.txt');
    }

    async start(): Promise<void> {
        // Clean up the output directory at startup for a fresh start
        const outputDir = path.join(__dirname, 'test-mcp-interactive');
        try {
            await fsPromises.rm(outputDir, { recursive: true, force: true });
            logger.log(colorize('🧹 Cleaned up previous test output', colors.dim, colors.gray));
        } catch (error) {
            // Directory might not exist, that's fine
        }

        logger.log(colorize('🚀 Starting MCP Server Test', colors.bold, colors.brightCyan));
        logger.log(colorize('='.repeat(50), colors.cyan));
        logger.log(colorize('Options:', colors.bold, colors.yellow));
        logger.log(`  ${colorize('Path:', colors.gray)} ${colorize(this.options.path, colors.brightWhite)}`);
        logger.log(`  ${colorize('Timeout:', colors.gray)} ${colorize(`${this.options.timeout || 30000}ms`, colors.brightWhite)}`);
        logger.log(
            `  ${colorize('Mode:', colors.gray)} ${colorize(this.options.useCompiled ? 'Compiled (dist)' : 'Development (tsx)', colors.brightWhite)}`,
        );
        if (this.options.saveInspectionLogs) {
            logger.log(`  ${colorize('Log Capture:', colors.gray)} ${colorize('ENABLED (Dev Only)', colors.yellow, colors.bold)}`);
        }
        if (this.options.verboseDebug) {
            logger.log(`  ${colorize('Verbose Debug:', colors.gray)} ${colorize('ENABLED', colors.magenta, colors.bold)}`);
            logger.log(`  ${colorize('Debug Output:', colors.gray)} ${colorize('./scripts/testing/test-mcp-interactive/', colors.brightCyan)}`);
        }
        logger.log(colorize('='.repeat(50), colors.cyan));
        logger.log();

        try {
            await this.startServer();
            await this.initialize();

            if (this.options.interactive) {
                await this.runInteractive();
            } else {
                await this.runSingleTest();
            }
        } catch (error) {
            logger.error(colorize('❌ Error:', colors.red, colors.bold), error);
        } finally {
            this.cleanup();
        }
    }

    private getServerPath(): string {
        const serverPath = this.options.useCompiled ? path.join(__dirname, '../../dist/index.js') : path.join(__dirname, '../../src/index.ts');

        if (!fs.existsSync(serverPath)) {
            throw new Error(
                `Server file not found at ${serverPath}. ` + (this.options.useCompiled ? 'Run "yarn build" first.' : 'Check src/index.ts exists.'),
            );
        }

        return serverPath;
    }

    private async startServer(): Promise<void> {
        const serverPath = this.getServerPath();
        const command = this.options.useCompiled ? 'node' : 'tsx';

        logger.log(colorize(`📦 Starting server: ${command} ${serverPath}`, colors.dim, colors.blue));

        this.serverProcess = spawn(command, [serverPath], {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: {
                ...process.env,
                DEBUG: 'jetbrains:*',
                INSPECTION_TIMEOUT: String(this.options.timeout || 30000),
                CAPTURE_INSPECTION_OUTPUT: 'true',
                MCP_VERBOSE_DEBUG: this.options.verboseDebug ? 'true' : 'false',
                MCP_DEBUG_OUTPUT_DIR: path.join(__dirname, 'test-mcp-interactive'),
            },
        });

        this.serverProcess.stdout?.on('data', (data: Buffer) => {
            const lines = data
                .toString()
                .split('\n')
                .filter((line) => line.trim());
            lines.forEach((line) => {
                try {
                    const response = JSON.parse(line);
                    this.handleResponse(response);
                } catch {
                    // Ignore non-JSON lines
                }
            });
        });

        this.serverProcess.stderr?.on('data', (data: Buffer) => {
            const rawMessage = data.toString();
            const lines = rawMessage.split('\n');

            for (const line of lines) {
                // Only process non-empty lines (but preserve leading spaces)
                const trimmedLine = line.trimEnd();
                if (trimmedLine.length === 0) continue;

                // Filter out Java/JetBrains warnings, stack traces and WARN messages
                const shouldLog =
                    !trimmedLine.includes('java.lang.Throwable') &&
                    !trimmedLine.includes('at com.intellij') &&
                    !trimmedLine.includes('at java.') &&
                    !trimmedLine.includes('at kotlin.') &&
                    !trimmedLine.includes('at kotlinx.') &&
                    !trimmedLine.includes('Caused by:') &&
                    !trimmedLine.includes('#c.i.o.p.Task') &&
                    !trimmedLine.includes('Empty title for backgroundable task') &&
                    !trimmedLine.includes('WARN -') &&
                    !trimmedLine.includes('WARN  -') &&
                    !trimmedLine.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} \[.*]\s+WARN/);

                // Check if this is IDE availability status (should be displayed as-is)
                const isIDEStatus = trimmedLine.includes('❌') || trimmedLine.includes('✅');

                if (shouldLog) {
                    if (isIDEStatus) {
                        // Display IDE status messages without prefix, preserving leading spaces
                        logger.error(line.trimEnd());
                    } else {
                        // Display other server logs with prefix
                        logger.error(colorize('⚠️  Server log:', colors.yellow), colorize(trimmedLine, colors.dim));
                    }
                }

                // Capture inspection logs if enabled (development only)
                if (this.options.saveInspectionLogs) {
                    this.inspectionLogStream.push(`[${new Date().toISOString()}] ${trimmedLine}`);

                    // Check if this is inspection output
                    if ((trimmedLine.includes('Running') && trimmedLine.includes('inspect:')) || trimmedLine.includes('INSPECTION_OUTPUT:')) {
                        // Mark this as inspection-specific output
                        this.inspectionLogStream.push('--- INSPECTION START ---');
                    }

                    // Check for raw JetBrains JSON output
                    if (trimmedLine.startsWith('RAW_JETBRAINS_JSON:')) {
                        try {
                            const jsonStr = trimmedLine.substring('RAW_JETBRAINS_JSON:'.length);
                            logger.log(colorize('\n\ud83d\udce6 Captured raw JetBrains JSON output', colors.green, colors.dim));
                        } catch (error) {
                            logger.error(colorize('Failed to parse raw JetBrains JSON:', colors.red), error);
                        }
                    }
                }
            }
        });

        this.serverProcess.on('error', (error: Error) => {
            logger.error(colorize('❌ Server process error:', colors.red, colors.bold), error);
        });

        this.serverProcess.on('exit', (code: number) => {
            logger.log(colorize(`\n🛑 Server exited with code ${code}`, colors.red));
        });

        // Give server time to start
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    private async initialize(): Promise<void> {
        logger.log(colorize('🔄 Initializing MCP connection...', colors.blue));

        const initRequest = {
            jsonrpc: '2.0',
            id: this.messageId++,
            method: 'initialize',
            params: {
                protocolVersion: '1.0.0',
                capabilities: {},
                clientInfo: {
                    name: 'mcp-test-client',
                    version: '1.0.0',
                },
            },
        };

        await this.sendRequest(initRequest);

        // Wait for initialization response
        await new Promise((resolve) => setTimeout(resolve, 1500));
        logger.log(colorize('✅ Initialized\n', colors.green, colors.bold));
    }

    private async sendRequest(request: MCPRequest): Promise<void> {
        const requestStr = JSON.stringify(request) + '\n';
        if (this.serverProcess && this.serverProcess.stdin) {
            this.serverProcess.stdin.write(requestStr);
        }
    }

    private extractInspectionResultFromMarkdown(text: string): InspectionResult | null {
        // Extract total issues from markdown
        const totalMatch = text.match(/\*\*Total Issues\*\*:\s*(\d+)/);
        const errorsMatch = text.match(/🔴\s*Errors:\s*(\d+)/);
        const warningsMatch = text.match(/🟡\s*Warnings:\s*(\d+)/);
        const infoMatch = text.match(/🔵\s*Info:\s*(\d+)/);

        if (totalMatch) {
            const result: InspectionResult = {
                totalProblems: parseInt(totalMatch[1], 10),
                diagnostics: [],
            };

            // Extract diagnostics from markdown sections
            const diagnostics: InspectionDiagnostic[] = [];

            // Parse error/warning/info sections
            const sectionMatches = text.matchAll(
                /- \*\*Line (\d+), Column (\d+)\*\*(?:\s*\(length:\s*\d+\))?\s*\n\s*- Code:\s*`([^`]+)`\s*\n\s*- [^:]+:\s*(.+?)(?:\s*\n|$)/g,
            );

            for (const match of sectionMatches) {
                diagnostics.push({
                    range: {
                        start: {
                            line: parseInt(match[1], 10),
                            character: parseInt(match[2], 10),
                        },
                    },
                    code: match[3],
                    message: match[4].trim(),
                    file: this.options.path,
                });
            }

            result.diagnostics = diagnostics;
            return result;
        }

        // Check for error messages
        if (text.includes('❌ Error:') || text.includes('No IDE found')) {
            const errorMatch = text.match(/❌\s*(?:Error:|.*?):\s*(.+)/);
            return {
                error: errorMatch ? errorMatch[1] : text,
                totalProblems: 0,
            };
        }

        // Check for no issues found
        if (text.includes('✅ No issues found')) {
            return {
                totalProblems: 0,
                diagnostics: [],
            };
        }

        return null;
    }

    private handleResponse(response: MCPResponse): void {
        if (response.id !== undefined) {
            logger.log(colorize('📥 Response received:', colors.green));

            if (response.result) {
                if (response.result.content) {
                    response.result.content.forEach(async (content) => {
                        if (content.type === 'text') {
                            // Log the raw content for debugging
                            logger.log(content.text);

                            // Save MCP response as markdown
                            await this.saveMCPResponse(content.text, 'text');

                            // Try to extract inspection result from markdown response
                            const result = this.extractInspectionResultFromMarkdown(content.text);
                            if (result) {
                                await this.displayInspectionResults(result);
                            }
                        }
                    });
                } else {
                    logger.log(JSON.stringify(response.result, null, 2));
                }
            } else if (response.error) {
                logger.error(colorize('❌ Error:', colors.red, colors.bold), response.error);
            }
        }
    }

    private async saveMCPResponse(data: any, type: 'text' | 'json'): Promise<void> {
        try {
            // Ensure output directory exists
            const outputDir = path.join(__dirname, 'test-mcp-interactive');
            await fsPromises.mkdir(outputDir, { recursive: true });

            // Clean up old response files
            try {
                await fsPromises.unlink(path.join(outputDir, 'raw-response.md'));
            } catch {}
            try {
                await fsPromises.unlink(path.join(outputDir, 'mcp-result.json'));
            } catch {}

            // Determine file extension based on response type
            const extension = type === 'text' ? '.md' : '.json';
            const responsePath = `${this.mcpResponsePath}${extension}`;

            // Save response in its original format
            const content = type === 'text' ? data : JSON.stringify(data, null, 2);
            await fsPromises.writeFile(responsePath, content, 'utf-8');

            logger.log(colorize(`\n📝 MCP response saved to: ${responsePath}`, colors.cyan, colors.dim));
        } catch (error) {
            logger.error(colorize('\n❌ Failed to save MCP response:', colors.red), error);
        }
    }

    private async saveResultsToFile(result: InspectionResult): Promise<void> {
        try {
            // Save inspection logs if enabled
            if (this.options.saveInspectionLogs && this.inspectionLogStream.length > 0) {
                await this.saveInspectionLogs();
            }
        } catch (error) {
            logger.error(colorize('\n❌ Failed to save logs:', colors.red), error);
        }
    }

    private async saveInspectionLogs(): Promise<void> {
        try {
            const logContent = [
                '='.repeat(60),
                `MCP JetBrains Inspection Log Stream`,
                `Timestamp: ${new Date().toISOString()}`,
                `Test Path: ${this.options.path}`,
                '='.repeat(60),
                '',
                ...this.inspectionLogStream,
                '',
                '='.repeat(60),
                'End of Log Stream',
                '='.repeat(60),
            ].join('\n');

            await fsPromises.writeFile(this.logFilePath, logContent, 'utf-8');

            logger.log(colorize(`📄 Inspection logs saved to: ${this.logFilePath}`, colors.cyan, colors.dim));
        } catch (error) {
            logger.error(colorize('Failed to save inspection logs:', colors.red), error);
        }
    }

    private async displayInspectionResults(result: InspectionResult): Promise<void> {
        // Store the result for potential reuse
        this.lastInspectionResult = result;

        // Save to file
        await this.saveResultsToFile(result);

        logger.log('\n' + colorize('='.repeat(50), colors.cyan, colors.bold));
        logger.log(colorize('📊 INSPECTION RESULTS', colors.bold, colors.brightCyan));
        logger.log(colorize('='.repeat(50), colors.cyan, colors.bold));

        if (result.error) {
            logger.log(colorize(`❌ Error: ${result.error}`, colors.red, colors.bold));
            if (result.errorCode) {
                logger.log(colorize(`   Code: ${result.errorCode}`, colors.red, colors.dim));
            }
            return;
        }

        // Source is the first file in diagnostics if available
        const source = result.diagnostics && result.diagnostics.length > 0 ? result.diagnostics[0].file : this.options.path;

        logger.log(`📁 ${colorize('Source:', colors.gray)} ${colorize(source || 'N/A', colors.brightWhite)}`);
        logger.log(
            `🔍 ${colorize('Total Problems:', colors.gray)} ${colorize(String(result.totalProblems || 0), (result.totalProblems || 0) > 0 ? colors.yellow : colors.green, colors.bold)}`,
        );

        if (result.diagnostics && result.diagnostics.length > 0) {
            logger.log(colorize(`\n📋 Diagnostics (${result.diagnostics.length} total):`, colors.bold, colors.yellow));

            // Group by severity
            const bySeverity: Record<string, InspectionDiagnostic[]> = {};
            result.diagnostics.forEach((diag) => {
                const severity = diag.severity || 'unknown';
                if (!bySeverity[severity]) {
                    bySeverity[severity] = [];
                }
                bySeverity[severity].push(diag);
            });

            // Display by severity
            ['error', 'warning', 'information', 'hint'].forEach((severity) => {
                if (bySeverity[severity]) {
                    const icon = severity === 'error' ? '🔴' : severity === 'warning' ? '🟡' : severity === 'information' ? '🔵' : '⚪';
                    const severityColor =
                        severity === 'error'
                            ? colors.red
                            : severity === 'warning'
                              ? colors.yellow
                              : severity === 'information'
                                ? colors.blue
                                : colors.gray;

                    logger.log(colorize(`\n${icon} ${severity.toUpperCase()} (${bySeverity[severity].length}):`, severityColor, colors.bold));

                    bySeverity[severity].forEach((diag) => {
                        // Find the global index of this diagnostic
                        const globalIndex = result.diagnostics ? result.diagnostics.indexOf(diag) + 1 : 1;
                        logger.log(
                            `  ${colorize(`[${globalIndex}/${result.diagnostics?.length || 0}]`, colors.dim)} ${colorize(diag.message, colors.white)}`,
                        );
                        if (diag.file) {
                            const location = diag.range ? `${diag.file}:${diag.range.start.line}:${diag.range.start.character}` : diag.file;
                            logger.log(`     📍 ${colorize(location, colors.cyan, colors.underline)}`);
                        }
                        if (diag.code) {
                            logger.log(`     🏷️  ${colorize(diag.code, colors.magenta)}`);
                        }
                    });
                }
            });
        } else {
            logger.log(colorize('\n✅ No issues found!', colors.green, colors.bold));
        }

        logger.log('\n' + colorize('='.repeat(50), colors.cyan, colors.bold));
    }

    private async runSingleTest(): Promise<void> {
        logger.log(colorize('🔍 Running inspection...\n', colors.blue, colors.bold));

        const args: Record<string, unknown> = {
            path: path.resolve(this.options.path),
        };

        if (this.options.timeout) {
            args.timeout = this.options.timeout;
        }

        const request = {
            jsonrpc: '2.0',
            id: this.messageId++,
            method: 'tools/call',
            params: {
                name: 'get_jetbrains_code_inspections',
                arguments: args,
            },
        };

        await this.sendRequest(request);

        // Wait for response
        await new Promise((resolve) => setTimeout(resolve, (this.options.timeout || 30000) + 5000));
    }

    private async runInteractive(): Promise<void> {
        logger.log(colorize('🎮 Interactive Mode - Commands:', colors.bold, colors.brightCyan));
        logger.log(`  ${colorize('inspect <path d="path">', colors.yellow)} - Run inspection on a file/directory`);
        logger.log(`  ${colorize('list', colors.yellow)} - List available tools`);
        logger.log(`  ${colorize('save', colors.yellow)} - Save last results to file`);
        logger.log(`  ${colorize('show', colors.yellow)} - Show output file path`);
        logger.log(`  ${colorize('exit', colors.yellow)} - Exit the tester`);
        logger.log();

        const askCommand = (): Promise<void> => {
            return new Promise((resolve) => {
                this.rl.question('> ', async (command) => {
                    const parts = command.trim().split(' ');
                    const cmd = parts[0];

                    switch (cmd) {
                        case 'inspect':
                            if (parts[1]) {
                                await this.runInspection(parts[1]);
                            } else {
                                logger.log(colorize('Usage: inspect <path d="path">', colors.red));
                            }
                            break;

                        case 'list':
                            await this.listTools();
                            break;

                        case 'save':
                            if (this.lastInspectionResult) {
                                await this.saveResultsToFile(this.lastInspectionResult);
                            } else {
                                logger.log(colorize('No inspection results to save. Run an inspection first.', colors.yellow));
                            }
                            break;

                        case 'show':
                            logger.log(colorize(`Output directory: ${path.join(__dirname, 'test-mcp-interactive')}`, colors.cyan));
                            break;

                        case 'exit':
                        case 'quit':
                            resolve();
                            return;

                        default:
                            logger.log(colorize('Unknown command. Type "exit" to quit.', colors.red));
                            break;
                    }

                    // Continue asking for commands
                    askCommand().then(resolve);
                });
            });
        };

        await askCommand();
    }

    private async runInspection(targetPath: string): Promise<void> {
        const args: Record<string, unknown> = {
            path: path.resolve(targetPath),
            // Note: timeout, exclude and include are now configured via environment variables only
        };

        const request = {
            jsonrpc: '2.0',
            id: this.messageId++,
            method: 'tools/call',
            params: {
                name: 'get_jetbrains_code_inspections',
                arguments: args,
            },
        };

        await this.sendRequest(request);
    }

    private async listTools(): Promise<void> {
        const request = {
            jsonrpc: '2.0',
            id: this.messageId++,
            method: 'tools/list',
            params: {},
        };

        await this.sendRequest(request);
    }

    private cleanup(): void {
        logger.log(colorize('\n🧹 Cleaning up...', colors.dim, colors.gray));

        if (this.options.saveInspectionLogs && this.inspectionLogStream.length > 0) {
            logger.log(colorize(`📄 Logs saved in: ${this.logFilePath}`, colors.dim, colors.gray));
        }

        if (this.serverProcess) {
            this.serverProcess.kill();
        }

        this.rl.close();
    }
}

// Parse command line arguments
function parseArgs(): TestOptions {
    const args = process.argv.slice(2);
    const options: TestOptions = {
        path: '',
        timeout: 30000,
        useCompiled: false,
        interactive: false,
        saveInspectionLogs: false,
        verboseDebug: true,
    };

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--path':
            case '-p':
                i++;
                options.path = args[i];
                break;

            case '--timeout':
            case '-t':
                i++;
                options.timeout = parseInt(args[i], 10);
                break;

            case '--compiled':
            case '-c':
                options.useCompiled = true;
                break;

            case '--interactive':
            case '-i':
                options.interactive = true;
                break;

            case '--exclude':
            case '-e':
                logger.log(colorize('Warning: --exclude is deprecated. Use EXCLUDE_INSPECTIONS environment variable instead.', colors.yellow));
                i++;
                break;

            case '--include':
                logger.log(colorize('Warning: --include is deprecated. Use INCLUDE_INSPECTIONS environment variable instead.', colors.yellow));
                i++;
                break;

            case '--save-logs':
            case '--logs':
                options.saveInspectionLogs = true;
                break;

            case '--verbose-debug':
            case '--debug':
                options.verboseDebug = true;
                break;

            case '--no-debug':
            case '--no-verbose-debug':
                options.verboseDebug = false;
                break;

            case '--help':
            case '-h':
                showHelp();
                process.exit(0);
        }
    }

    // Validate required arguments
    if (!options.path && !options.interactive) {
        logger.error(colorize('❌ Error: --path is required (unless using --interactive mode)\n', colors.red, colors.bold));
        showHelp();
        process.exit(1);
    }

    return options;
}

function showHelp(): void {
    logger.log(`
${colorize('MCP JetBrains Inspections Server Tester', colors.bold, colors.brightCyan)}

${colorize('Usage:', colors.bold, colors.yellow)}
  yarn test:mcp [options]

${colorize('Options:', colors.bold, colors.yellow)}
  --path, -p <path>         File or directory to inspect (required unless --interactive)
  --timeout, -t <ms>        Script timeout in milliseconds (default: 30000)
  --include <codes>         Comma-separated list of inspection codes to include (exclusive)
                            Example: --include TypeScriptInspections,JSHint
  --compiled, -c            Use compiled version (dist/) instead of dev (src/)
  --interactive, -i         Interactive mode - run multiple commands
  --save-logs, --logs       Save inspection output logs to .txt file (DEV ONLY)
  --verbose-debug, --debug  Enable verbose debug mode (DEFAULT: ENABLED)
  --no-debug                Disable verbose debug mode
  --help, -h                Show this help message

${colorize('Examples:', colors.bold, colors.yellow)}
  ${colorize('# Test a single file with default options', colors.dim)}
  yarn test:mcp --path src/index.ts

  ${colorize('# Test with longer timeout', colors.dim)}
  yarn test:mcp --path src/ --timeout 60000

  ${colorize('# Interactive mode', colors.dim)}
  yarn test:mcp --interactive --path src/

  ${colorize('# Use compiled version', colors.dim)}
  yarn test:mcp --path src/index.ts --compiled

  ${colorize('# Enable verbose debug mode for detailed inspection info', colors.dim)}
  yarn test:mcp --path src/index.ts --verbose-debug

  ${colorize('# Exclude spelling inspections', colors.dim)}
  yarn test:mcp --path src/ --exclude SpellCheckingInspection

  ${colorize('# Only include TypeScript inspections', colors.dim)}
  yarn test:mcp --path src/ --include TypeScriptInspection
`);
}

// Main execution
async function main() {
    try {
        const options = parseArgs();
        const tester = new MCPServerTester(options);
        await tester.start();
    } catch (error) {
        logger.error(colorize('❌ Fatal error:', colors.red, colors.bold), error);
        process.exit(1);
    }
}

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
    logger.error(colorize('❌ Unhandled Rejection at:', colors.red, colors.bold), promise, 'reason:', reason);
    process.exit(1);
});

void main();
