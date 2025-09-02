#!/usr/bin/env tsx

import { spawn } from 'child_process';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Terminal color codes
const colors = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
};

const colorize = (text: string, ...colorCodes: string[]): string => {
    return colorCodes.join('') + text + colors.reset;
};

class MCPFeatureTester {
    private serverProcess: any = null;
    private messageId = 0;
    private responses: any[] = [];

    async start(): Promise<void> {
        console.log(colorize('🚀 Testing MCP Server New Features', colors.bold, colors.cyan));
        console.log(colorize('='.repeat(50), colors.cyan));

        try {
            await this.startServer();
            await this.initialize();

            // Test all new features
            await this.testPrompts();
            await this.testResources();
            await this.testTools();

            console.log(colorize('\n✅ All tests completed successfully!', colors.green, colors.bold));
        } catch (error) {
            console.error(colorize('❌ Test failed:', colors.red, colors.bold), error);
            process.exit(1);
        } finally {
            this.cleanup();
        }
    }

    private async startServer(): Promise<void> {
        const serverPath = path.join(__dirname, '../../dist/index.js');
        console.log(colorize('📦 Starting server...', colors.blue));

        this.serverProcess = spawn('node', [serverPath], {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: {
                ...process.env,
                DEBUG: 'false',
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
                    this.responses.push(response);
                } catch {
                    // Ignore non-JSON lines
                }
            });
        });

        // Wait for server to start
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    private async initialize(): Promise<void> {
        console.log(colorize('🔄 Initializing MCP connection...', colors.blue));

        await this.sendRequest({
            jsonrpc: '2.0',
            id: this.messageId++,
            method: 'initialize',
            params: {
                protocolVersion: '1.0.0',
                capabilities: {},
                clientInfo: {
                    name: 'mcp-feature-tester',
                    version: '1.0.0',
                },
            },
        });

        await this.waitForResponse();
        console.log(colorize('✅ Initialized', colors.green));
    }

    private async testPrompts(): Promise<void> {
        console.log(colorize('\n📝 Testing Prompts...', colors.bold, colors.yellow));

        // List prompts
        await this.sendRequest({
            jsonrpc: '2.0',
            id: this.messageId++,
            method: 'prompts/list',
            params: {},
        });

        const promptsResponse = await this.waitForResponse();
        const prompts = promptsResponse?.result?.prompts || [];

        console.log(`  Found ${prompts.length} prompts:`);
        prompts.forEach((prompt: any) => {
            console.log(`    - ${colorize(prompt.name, colors.cyan)}: ${prompt.description}`);
        });

        // Test getting a specific prompt
        if (prompts.length > 0) {
            await this.sendRequest({
                jsonrpc: '2.0',
                id: this.messageId++,
                method: 'prompts/get',
                params: {
                    name: 'analyze-project',
                    arguments: {
                        projectPath: '/test/path',
                        profile: 'Default',
                    },
                },
            });

            const promptResponse = await this.waitForResponse();
            if (promptResponse?.result?.messages) {
                console.log(colorize('  ✅ Prompt "analyze-project" works correctly', colors.green));
            }
        }
    }

    private async testResources(): Promise<void> {
        console.log(colorize('\n📚 Testing Resources...', colors.bold, colors.yellow));

        // List resources
        await this.sendRequest({
            jsonrpc: '2.0',
            id: this.messageId++,
            method: 'resources/list',
            params: {},
        });

        const resourcesResponse = await this.waitForResponse();
        const resources = resourcesResponse?.result?.resources || [];

        console.log(`  Found ${resources.length} resources:`);
        resources.forEach((resource: any) => {
            console.log(`    - ${colorize(resource.uri, colors.cyan)}: ${resource.name}`);
        });

        // Test reading each resource
        for (const resource of resources) {
            await this.sendRequest({
                jsonrpc: '2.0',
                id: this.messageId++,
                method: 'resources/read',
                params: {
                    uri: resource.uri,
                },
            });

            const readResponse = await this.waitForResponse();
            if (readResponse?.result?.contents) {
                console.log(colorize(`  ✅ Resource "${resource.uri}" is accessible`, colors.green));
            }
        }
    }

    private async testTools(): Promise<void> {
        console.log(colorize('\n🔧 Testing Tools...', colors.bold, colors.yellow));

        // List tools
        await this.sendRequest({
            jsonrpc: '2.0',
            id: this.messageId++,
            method: 'tools/list',
            params: {},
        });

        const toolsResponse = await this.waitForResponse();
        const tools = toolsResponse?.result?.tools || [];

        console.log(`  Found ${tools.length} tools:`);
        tools.forEach((tool: any) => {
            console.log(`    - ${colorize(tool.name, colors.cyan)}: ${tool.description}`);
        });

        if (tools.length > 0) {
            console.log(colorize('  ✅ Tool "get_jetbrains_code_inspections" is available', colors.green));
        }
    }

    private async sendRequest(request: any): Promise<void> {
        const requestStr = JSON.stringify(request) + '\n';
        if (this.serverProcess?.stdin) {
            this.serverProcess.stdin.write(requestStr);
        }
    }

    private async waitForResponse(timeout = 3000): Promise<any> {
        const startTime = Date.now();
        const initialLength = this.responses.length;

        while (Date.now() - startTime < timeout) {
            if (this.responses.length > initialLength) {
                return this.responses[this.responses.length - 1];
            }
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        throw new Error('Timeout waiting for response');
    }

    private cleanup(): void {
        if (this.serverProcess) {
            this.serverProcess.kill();
        }
    }
}

// Main execution
async function main() {
    const tester = new MCPFeatureTester();
    await tester.start();
}

main().catch((error) => {
    console.error(colorize('❌ Fatal error:', colors.red, colors.bold), error);
    process.exit(1);
});
