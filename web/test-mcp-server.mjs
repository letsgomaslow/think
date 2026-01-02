#!/usr/bin/env node
/**
 * MCP Server Test Script
 *
 * Tests the local MCP server endpoints without conflicts.
 * Run: node test-mcp-server.mjs [port]
 *
 * Default port: 3000 (Next.js dev server)
 */

const PORT = process.argv[2] || 3000;
const BASE_URL = `http://localhost:${PORT}/api/mcp`;

async function sendRequest(method, params = {}) {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params,
    }),
  });

  const text = await response.text();

  // Handle JSON response
  try {
    return JSON.parse(text);
  } catch {
    // Handle SSE response (parse last JSON line)
    const lines = text.trim().split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].startsWith('data: ')) {
        return JSON.parse(lines[i].slice(6));
      }
    }
    return { error: { message: 'Failed to parse response' } };
  }
}

async function testTools() {
  console.log('\n📋 Testing tools/list...');
  const tools = await sendRequest('tools/list');

  if (tools.error) {
    console.log(`   ✗ Error: ${tools.error.message}`);
    return [];
  }

  console.log(`   ✓ Found ${tools.result?.tools?.length || 0} tools`);
  tools.result?.tools?.forEach(t => console.log(`     - ${t.name}`));
  return tools.result?.tools || [];
}

async function testResources() {
  console.log('\n📚 Testing resources/list...');
  const resources = await sendRequest('resources/list');

  if (resources.error) {
    console.log(`   ✗ Error: ${resources.error.message}`);
    return [];
  }

  console.log(`   ✓ Found ${resources.result?.resources?.length || 0} resources`);

  // Show first 5 resources
  resources.result?.resources?.slice(0, 5).forEach(r =>
    console.log(`     - ${r.uri}`)
  );
  if (resources.result?.resources?.length > 5) {
    console.log(`     ... and ${resources.result.resources.length - 5} more`);
  }
  return resources.result?.resources || [];
}

async function testPrompts() {
  console.log('\n💬 Testing prompts/list...');
  const prompts = await sendRequest('prompts/list');

  if (prompts.error) {
    console.log(`   ✗ Error: ${prompts.error.message}`);
    return [];
  }

  console.log(`   ✓ Found ${prompts.result?.prompts?.length || 0} prompts`);
  prompts.result?.prompts?.forEach(p => console.log(`     - ${p.name}`));
  return prompts.result?.prompts || [];
}

async function testToolCall(toolName, args) {
  console.log(`\n🔧 Testing tools/call: ${toolName}...`);
  const result = await sendRequest('tools/call', {
    name: toolName,
    arguments: args,
  });

  if (result.error) {
    console.log(`   ✗ Error: ${result.error.message}`);
    return null;
  }

  // Parse the content (it's a text block)
  const content = result.result?.content?.[0];
  if (content?.type === 'text') {
    try {
      const data = JSON.parse(content.text);
      console.log(`   ✓ Success: ${data.success ? 'true' : 'false'}`);
      console.log(`   ✓ Tool: ${data.tool}`);
      console.log(`   ✓ Processing time: ${data.metadata?.processingTimeMs}ms`);
      console.log(`   ✓ Version: ${data.metadata?.version}`);
      return data;
    } catch {
      console.log(`   ✓ Response received (non-JSON)`);
      return content;
    }
  }

  console.log(`   ✓ Response received`);
  return result.result;
}

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  think-mcp Server Test Suite');
  console.log('═══════════════════════════════════════════════');
  console.log(`  Base URL: ${BASE_URL}`);
  console.log('═══════════════════════════════════════════════');

  try {
    // Test tools list
    const tools = await testTools();

    // Test resources list
    const resources = await testResources();

    // Test prompts list
    const prompts = await testPrompts();

    // Test a tool call (trace)
    if (tools.length > 0) {
      await testToolCall('trace', {
        thought: 'Testing the MCP server',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
      });

      // Test a tool call (model)
      await testToolCall('model', {
        modelName: 'first_principles',
        problem: 'How to test an MCP server',
        steps: ['Identify endpoints', 'Test each endpoint', 'Verify responses'],
      });
    }

    console.log('\n═══════════════════════════════════════════════');
    console.log('  Summary');
    console.log('═══════════════════════════════════════════════');
    console.log(`  ✓ Tools: ${tools.length}`);
    console.log(`  ✓ Resources: ${resources.length}`);
    console.log(`  ✓ Prompts: ${prompts.length}`);
    console.log('═══════════════════════════════════════════════');

    if (tools.length >= 11 && resources.length > 0 && prompts.length >= 4) {
      console.log('\n✅ All tests passed!\n');
    } else {
      console.log('\n⚠️  Some features may be missing. Check the server logs.\n');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('   Make sure the dev server is running: npm run dev');
    process.exit(1);
  }
}

main();
