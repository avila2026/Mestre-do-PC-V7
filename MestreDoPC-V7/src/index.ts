/**
 * MestreDoPC V7 - MCP Server
 * 
 * Main entry point for the MCP (Model Context Protocol) server
 * that exposes Windows maintenance tools to AI assistants.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { logger } from './logger.js';
import { getAvailableTools } from './security/whitelist.js';
import { executeLauncherCommand } from './launcher-client.js';

/**
 * MCP Server configuration
 */
const SERVER_NAME = 'mestredopc-v7';
const SERVER_VERSION = '7.0.0';

/**
 * Initialize and start the MCP server
 */
async function main() {
  logger.info('Starting MestreDoPC V7 MCP Server...');

  const server = new Server(
    {
      name: SERVER_NAME,
      version: SERVER_VERSION,
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Handle ListTools request
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const tools = getAvailableTools().map((toolName) => ({
      name: toolName,
      description: `Execute Windows maintenance tool: ${toolName}`,
      inputSchema: {
        type: 'object',
        properties: {
          params: {
            type: 'object',
            description: 'Tool-specific parameters',
          },
        },
      },
    }));

    logger.info({ toolCount: tools.length }, 'Listed available tools');
    return { tools };
  });

  // Handle CallTool request
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const requestId = `call-${Date.now()}`;
    const toolLogger = logger.child({ requestId, toolName: name });

    toolLogger.info('Executing tool call');

    try {
      const params = (args?.params || {}) as Record<string, string>;
      const result = await executeLauncherCommand(name, params);
      toolLogger.info({ success: true }, 'Tool execution completed');
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toolLogger.error({ error: errorMessage }, 'Tool execution failed');
      return {
        content: [{ type: 'text', text: `Error: ${errorMessage}` }],
        isError: true,
      };
    }
  });

  // Start server with stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info('MCP Server started successfully');
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error({ error: error.message }, 'Uncaught exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled rejection');
  process.exit(1);
});

// Start the server
main().catch((error) => {
  logger.error({ error: error.message }, 'Failed to start server');
  process.exit(1);
});
