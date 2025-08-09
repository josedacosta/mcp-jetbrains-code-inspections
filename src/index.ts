#!/usr/bin/env node
import { Application } from './Application.js';

/**
 * Main entry point for the MCP JetBrains Code Inspections
 */
async function main() {
    const app = new Application();

    try {
        await app.start();
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((error) => {
        console.error('Unhandled error:', error);
        process.exit(1);
    });
}

export { Application };
export { MCPServer } from './mcp/server/MCPServer.js';
export { InspectionTool } from './mcp/tools/InspectionTool.js';
export { InspectionExecutor } from './core/inspection/InspectionExecutor.js';
