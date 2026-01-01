import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { registerAllTools } from '@/lib/mcp-tools';
import { registerAllResources } from '@/lib/resources';
import { registerAllPrompts } from '@/lib/prompts';

// Create a stateless transport (no session management)
// For stateless operation, we can share the transport and server
const transport = new WebStandardStreamableHTTPServerTransport({
  sessionIdGenerator: undefined,
  enableJsonResponse: true  // Enable JSON response mode for simpler client handling
});

// Create and initialize the MCP server once
const server = new McpServer({
  name: 'think-mcp',
  version: '2.0.0'
});

// Register all tools, resources, and prompts
registerAllTools(server);
registerAllResources(server);
registerAllPrompts(server);

// Connect server to transport (only once)
let connectionPromise: Promise<void> | null = null;

async function ensureConnected() {
  if (!connectionPromise) {
    connectionPromise = server.connect(transport);
  }
  return connectionPromise;
}

export async function POST(request: Request): Promise<Response> {
  await ensureConnected();
  return transport.handleRequest(request);
}

export async function GET(request: Request): Promise<Response> {
  await ensureConnected();
  return transport.handleRequest(request);
}

export async function DELETE(request: Request): Promise<Response> {
  await ensureConnected();
  return transport.handleRequest(request);
}
