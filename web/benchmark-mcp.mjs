#!/usr/bin/env node
/**
 * MCP Server Performance Benchmark
 *
 * Compares current implementation against previous baselines.
 * Focuses on performance metrics, not UX improvements.
 *
 * Run: node benchmark-mcp.mjs [port]
 */

const PORT = process.argv[2] || 3000;
const BASE_URL = `http://localhost:${PORT}/api/mcp`;

// Previous baseline averages (from test-results/think-mcp-eval-results.jsonl)
const BASELINE = {
  trace: { avgMs: 177, tests: 5 },
  model: { avgMs: 196, tests: 6 },
  pattern: { avgMs: 199, tests: 6 },
  paradigm: { avgMs: 189, tests: 6 },
  debug: { avgMs: 194, tests: 6 },
  council: { avgMs: 300, tests: 2 },
  decide: { avgMs: 229, tests: 3 },
  reflect: { avgMs: 204, tests: 3 },
  hypothesis: { avgMs: 249, tests: 3 },
  debate: { avgMs: 187, tests: 4 },
  map: { avgMs: 206, tests: 3 },
};

// Test scenarios extracted from previous baseline tests
const TEST_SCENARIOS = {
  trace: [
    { testId: 'trace-basic-001', args: { thought: 'Breaking down a complex software architecture decision', thoughtNumber: 1, totalThoughts: 5, nextThoughtNeeded: true } },
    { testId: 'trace-edge-001', args: { thought: 'Revising earlier assumption', thoughtNumber: 3, totalThoughts: 5, nextThoughtNeeded: true, isRevision: true, revisesThought: 1 } },
    { testId: 'trace-edge-002', args: { thought: 'Branching to explore alternative', thoughtNumber: 4, totalThoughts: 6, nextThoughtNeeded: true, branchFromThought: 2, branchId: 'alt-approach-1' } },
    { testId: 'trace-edge-003', args: { thought: 'Final conclusion', thoughtNumber: 5, totalThoughts: 5, nextThoughtNeeded: false } },
  ],
  model: [
    { testId: 'model-basic-001', args: { modelName: 'first_principles', problem: 'Designing scalable microservices' } },
    { testId: 'model-edge-001', args: { modelName: 'opportunity_cost', problem: 'Build vs buy decision' } },
    { testId: 'model-edge-002', args: { modelName: 'rubber_duck', problem: 'Async function debugging' } },
    { testId: 'model-edge-003', args: { modelName: 'pareto_principle', problem: 'Bug prioritization' } },
    { testId: 'model-edge-004', args: { modelName: 'occams_razor', problem: 'Slow app diagnosis' } },
    { testId: 'model-edge-005', args: { modelName: 'error_propagation', problem: 'Cascading failure analysis' } },
  ],
  pattern: [
    { testId: 'pattern-basic-001', args: { patternName: 'api_integration', context: 'REST API gateway design' } },
    { testId: 'pattern-edge-001', args: { patternName: 'state_management', context: 'React form state' } },
    { testId: 'pattern-edge-002', args: { patternName: 'async_processing', context: 'File upload with progress' } },
    { testId: 'pattern-edge-003', args: { patternName: 'security', context: 'API authentication' } },
    { testId: 'pattern-edge-004', args: { patternName: 'scalability', context: '10x traffic growth' } },
    { testId: 'pattern-edge-005', args: { patternName: 'agentic_design', context: 'Autonomous AI agent' } },
  ],
  paradigm: [
    { testId: 'paradigm-basic-001', args: { paradigmName: 'functional', problem: 'Transaction processing' } },
    { testId: 'paradigm-edge-001', args: { paradigmName: 'reactive', problem: 'Real-time dashboard' } },
    { testId: 'paradigm-edge-002', args: { paradigmName: 'event_driven', problem: 'Microservices notifications' } },
    { testId: 'paradigm-edge-003', args: { paradigmName: 'object_oriented', problem: 'Complex domain modeling' } },
    { testId: 'paradigm-edge-004', args: { paradigmName: 'concurrent', problem: 'Parallel API processing' } },
  ],
  debug: [
    { testId: 'debug-basic-001', args: { approachName: 'binary_search', issue: 'Intermittent crashes after deployment' } },
    { testId: 'debug-edge-001', args: { approachName: 'divide_conquer', issue: 'Memory leak investigation' } },
    { testId: 'debug-edge-002', args: { approachName: 'cause_elimination', issue: 'Inconsistent login failures' } },
    { testId: 'debug-edge-003', args: { approachName: 'backtracking', issue: 'Recursive algorithm edge case' } },
    { testId: 'debug-edge-004', args: { approachName: 'program_slicing', issue: 'Unexpected variable value' } },
  ],
  council: [
    { testId: 'council-basic-001', args: {
      topic: 'Monolith to microservices migration',
      personas: [
        { id: 'arch', name: 'Architect', expertise: ['system design'], background: 'Senior architect', perspective: 'Technical', biases: ['complexity'], communication: { style: 'formal', tone: 'analytical' } },
        { id: 'dev', name: 'Developer', expertise: ['implementation'], background: 'Staff engineer', perspective: 'Practical', biases: ['simplicity'], communication: { style: 'direct', tone: 'pragmatic' } },
        { id: 'pm', name: 'Product Manager', expertise: ['product'], background: 'Senior PM', perspective: 'Business', biases: ['features'], communication: { style: 'collaborative', tone: 'optimistic' } },
      ],
      contributions: [],
      stage: 'ideation',
      activePersonaId: 'arch',
      sessionId: 'bench-001',
      iteration: 0,
      nextContributionNeeded: true
    }},
  ],
  decide: [
    { testId: 'decide-basic-001', args: {
      decisionStatement: 'Cloud provider selection',
      options: [
        { name: 'AWS', description: 'Amazon Web Services' },
        { name: 'GCP', description: 'Google Cloud Platform' },
        { name: 'Azure', description: 'Microsoft Azure' },
      ],
      analysisType: 'weighted-criteria',
      stage: 'evaluation',
      decisionId: 'bench-decide-001',
      iteration: 0,
      nextStageNeeded: true
    }},
    { testId: 'decide-edge-001', args: {
      decisionStatement: 'GraphQL vs REST',
      options: [
        { name: 'GraphQL', description: 'Query language for APIs' },
        { name: 'REST', description: 'Representational State Transfer' },
      ],
      analysisType: 'pros-cons',
      stage: 'options-generation',
      decisionId: 'bench-decide-002',
      iteration: 0,
      nextStageNeeded: true
    }},
  ],
  reflect: [
    { testId: 'reflect-basic-001', args: {
      task: 'System design assessment',
      stage: 'monitoring',
      overallConfidence: 0.7,
      uncertaintyAreas: ['scalability'],
      recommendedApproach: 'iterative review',
      monitoringId: 'bench-reflect-001',
      iteration: 0,
      nextAssessmentNeeded: true
    }},
  ],
  hypothesis: [
    { testId: 'hypothesis-basic-001', args: {
      stage: 'hypothesis',
      inquiryId: 'bench-hyp-001',
      observation: 'API response times increased 3x',
      iteration: 0,
      nextStageNeeded: true
    }},
    { testId: 'hypothesis-edge-001', args: {
      stage: 'experiment',
      inquiryId: 'bench-hyp-002',
      iteration: 2,
      nextStageNeeded: true
    }},
  ],
  debate: [
    { testId: 'debate-basic-001', args: {
      claim: 'Serverless is superior',
      premises: ['Reduced operational overhead', 'Auto-scaling'],
      conclusion: 'Serverless should be default choice',
      argumentType: 'thesis',
      confidence: 0.75,
      nextArgumentNeeded: true
    }},
    { testId: 'debate-edge-001', args: {
      claim: 'Containers provide best balance',
      premises: ['Full control', 'Portability'],
      conclusion: 'Containers offer more flexibility',
      argumentType: 'antithesis',
      confidence: 0.7,
      respondsTo: 'arg-001',
      nextArgumentNeeded: true
    }},
    { testId: 'debate-edge-002', args: {
      claim: 'Hybrid approach optimizes both',
      premises: ['Combine strengths', 'Use case dependent'],
      conclusion: 'Use both strategically',
      argumentType: 'synthesis',
      confidence: 0.85,
      nextArgumentNeeded: false
    }},
  ],
  map: [
    { testId: 'map-basic-001', args: {
      operation: 'create',
      diagramId: 'bench-map-001',
      diagramType: 'flowchart',
      elements: [
        { id: 'start', type: 'node', properties: { label: 'Start' } },
        { id: 'process', type: 'node', properties: { label: 'Process' } },
        { id: 'end', type: 'node', properties: { label: 'End' } },
        { id: 'e1', type: 'edge', source: 'start', target: 'process', properties: {} },
        { id: 'e2', type: 'edge', source: 'process', target: 'end', properties: {} },
      ],
      iteration: 0,
      nextOperationNeeded: true
    }},
    { testId: 'map-edge-001', args: {
      operation: 'observe',
      diagramId: 'bench-map-001',
      diagramType: 'flowchart',
      insight: 'Gateway pattern enables scaling',
      iteration: 1,
      nextOperationNeeded: false
    }},
  ],
};

// Results storage
const results = {
  tools: {},
  resources: null,
  prompts: null,
  validation: { passed: 0, failed: 0, errors: [] },
  performance: { improved: 0, regressed: 0, neutral: 0 },
};

async function sendRequest(method, params = {}) {
  const start = performance.now();

  try {
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
    const durationMs = performance.now() - start;

    try {
      const json = JSON.parse(text);
      return { ...json, durationMs, raw: text };
    } catch {
      // Handle SSE response
      const lines = text.trim().split('\n');
      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].startsWith('data: ')) {
          return { ...JSON.parse(lines[i].slice(6)), durationMs, raw: text };
        }
      }
      return { error: { message: 'Failed to parse response' }, durationMs };
    }
  } catch (error) {
    return { error: { message: error.message }, durationMs: performance.now() - start };
  }
}

/**
 * Validate standardized response format (PR 12)
 */
function validateResponseFormat(response, toolName) {
  const issues = [];

  if (!response.result) {
    issues.push('Missing result object');
    return { valid: false, issues };
  }

  const { result } = response;

  // Check for standardized response wrapper
  if (typeof result.success !== 'boolean') {
    issues.push('Missing or invalid "success" field');
  }
  if (result.tool !== toolName) {
    issues.push(`Tool mismatch: expected "${toolName}", got "${result.tool}"`);
  }
  if (!result.data) {
    issues.push('Missing "data" field');
  }
  if (!result.metadata) {
    issues.push('Missing "metadata" field');
  } else {
    if (typeof result.metadata.processingTimeMs !== 'number') {
      issues.push('Missing metadata.processingTimeMs');
    }
    if (result.metadata.version !== '2.0.0') {
      issues.push(`Version mismatch: expected "2.0.0", got "${result.metadata.version}"`);
    }
    if (!result.metadata.timestamp) {
      issues.push('Missing metadata.timestamp');
    }
    if (!result.metadata.requestId) {
      issues.push('Missing metadata.requestId');
    }
  }

  return { valid: issues.length === 0, issues };
}

async function benchmarkTool(toolName, scenarios) {
  const toolResults = {
    name: toolName,
    tests: [],
    avgMs: 0,
    minMs: Infinity,
    maxMs: 0,
    validationPassed: 0,
    validationFailed: 0,
  };

  for (const scenario of scenarios) {
    const response = await sendRequest('tools/call', {
      name: toolName,
      arguments: scenario.args,
    });

    const validation = validateResponseFormat(response, toolName);

    if (validation.valid) {
      toolResults.validationPassed++;
      results.validation.passed++;
    } else {
      toolResults.validationFailed++;
      results.validation.failed++;
      results.validation.errors.push({ testId: scenario.testId, issues: validation.issues });
    }

    const testResult = {
      testId: scenario.testId,
      durationMs: Math.round(response.durationMs * 100) / 100,
      success: response.result?.success ?? false,
      validationPassed: validation.valid,
      issues: validation.issues,
    };

    toolResults.tests.push(testResult);
    toolResults.avgMs += response.durationMs;
    toolResults.minMs = Math.min(toolResults.minMs, response.durationMs);
    toolResults.maxMs = Math.max(toolResults.maxMs, response.durationMs);
  }

  toolResults.avgMs = Math.round((toolResults.avgMs / scenarios.length) * 100) / 100;
  toolResults.minMs = Math.round(toolResults.minMs * 100) / 100;
  toolResults.maxMs = Math.round(toolResults.maxMs * 100) / 100;

  return toolResults;
}

async function benchmarkResources() {
  const start = performance.now();
  const response = await sendRequest('resources/list');
  const listDuration = performance.now() - start;

  if (response.error) {
    return { error: response.error.message };
  }

  const resourceCount = response.result?.resources?.length || 0;

  // Test reading a resource
  const readStart = performance.now();
  const readResponse = await sendRequest('resources/read', { uri: 'think://models' });
  const readDuration = performance.now() - readStart;

  return {
    count: resourceCount,
    listDurationMs: Math.round(listDuration * 100) / 100,
    readDurationMs: Math.round(readDuration * 100) / 100,
    readSuccess: !readResponse.error,
  };
}

async function benchmarkPrompts() {
  const start = performance.now();
  const response = await sendRequest('prompts/list');
  const listDuration = performance.now() - start;

  if (response.error) {
    return { error: response.error.message };
  }

  const promptCount = response.result?.prompts?.length || 0;

  // Test getting a prompt
  const getStart = performance.now();
  const getResponse = await sendRequest('prompts/get', {
    name: 'analyze-problem',
    arguments: { problem: 'Benchmark test', context: 'Performance testing' }
  });
  const getDuration = performance.now() - getStart;

  return {
    count: promptCount,
    listDurationMs: Math.round(listDuration * 100) / 100,
    getDurationMs: Math.round(getDuration * 100) / 100,
    getSuccess: !getResponse.error && getResponse.result?.messages?.length > 0,
  };
}

function compareWithBaseline(toolName, currentAvg) {
  const baseline = BASELINE[toolName];
  if (!baseline) return { status: 'no-baseline', delta: 0 };

  const delta = currentAvg - baseline.avgMs;
  const percentChange = ((delta / baseline.avgMs) * 100).toFixed(1);

  if (delta < -5) {
    results.performance.improved++;
    return { status: 'improved', delta, percentChange: `-${Math.abs(percentChange)}%`, baseline: baseline.avgMs };
  } else if (delta > 10) {
    results.performance.regressed++;
    return { status: 'regressed', delta, percentChange: `+${percentChange}%`, baseline: baseline.avgMs };
  } else {
    results.performance.neutral++;
    return { status: 'neutral', delta, percentChange: `${delta >= 0 ? '+' : ''}${percentChange}%`, baseline: baseline.avgMs };
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log('  think-mcp Performance Benchmark');
  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log(`  Server: ${BASE_URL}`);
  console.log(`  Date: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════════════════════════\n');

  try {
    // Benchmark all tools
    console.log('🔧 TOOL PERFORMANCE BENCHMARKS\n');
    console.log('┌────────────┬──────────┬──────────┬──────────┬────────────┬─────────────────┐');
    console.log('│ Tool       │ Avg (ms) │ Min (ms) │ Max (ms) │ Baseline   │ Change          │');
    console.log('├────────────┼──────────┼──────────┼──────────┼────────────┼─────────────────┤');

    for (const [toolName, scenarios] of Object.entries(TEST_SCENARIOS)) {
      const toolResults = await benchmarkTool(toolName, scenarios);
      results.tools[toolName] = toolResults;

      const comparison = compareWithBaseline(toolName, toolResults.avgMs);
      const statusIcon = comparison.status === 'improved' ? '✅' :
                         comparison.status === 'regressed' ? '❌' : '➖';

      console.log(`│ ${toolName.padEnd(10)} │ ${toolResults.avgMs.toString().padStart(8)} │ ${toolResults.minMs.toString().padStart(8)} │ ${toolResults.maxMs.toString().padStart(8)} │ ${(comparison.baseline || 'N/A').toString().padStart(10)} │ ${statusIcon} ${(comparison.percentChange || 'N/A').padStart(12)} │`);
    }

    console.log('└────────────┴──────────┴──────────┴──────────┴────────────┴─────────────────┘\n');

    // Benchmark resources
    console.log('📚 RESOURCES BENCHMARK\n');
    results.resources = await benchmarkResources();
    if (results.resources.error) {
      console.log(`   ❌ Error: ${results.resources.error}`);
    } else {
      console.log(`   Resources found: ${results.resources.count}`);
      console.log(`   List duration: ${results.resources.listDurationMs}ms`);
      console.log(`   Read duration: ${results.resources.readDurationMs}ms`);
      console.log(`   Read success: ${results.resources.readSuccess ? '✅' : '❌'}`);
    }
    console.log();

    // Benchmark prompts
    console.log('💬 PROMPTS BENCHMARK\n');
    results.prompts = await benchmarkPrompts();
    if (results.prompts.error) {
      console.log(`   ❌ Error: ${results.prompts.error}`);
    } else {
      console.log(`   Prompts found: ${results.prompts.count}`);
      console.log(`   List duration: ${results.prompts.listDurationMs}ms`);
      console.log(`   Get duration: ${results.prompts.getDurationMs}ms`);
      console.log(`   Get success: ${results.prompts.getSuccess ? '✅' : '❌'}`);
    }
    console.log();

    // Validation summary
    console.log('✅ STANDARDIZED RESPONSE VALIDATION (PR 12)\n');
    console.log(`   Passed: ${results.validation.passed}`);
    console.log(`   Failed: ${results.validation.failed}`);
    if (results.validation.errors.length > 0) {
      console.log('   Errors:');
      results.validation.errors.forEach(e => {
        console.log(`     - ${e.testId}: ${e.issues.join(', ')}`);
      });
    }
    console.log();

    // Performance summary
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('  PERFORMANCE COMPARISON SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log(`   ✅ Improved: ${results.performance.improved} tools`);
    console.log(`   ➖ Neutral:  ${results.performance.neutral} tools`);
    console.log(`   ❌ Regressed: ${results.performance.regressed} tools`);
    console.log();

    // Overall assessment
    const totalTests = Object.values(results.tools).reduce((sum, t) => sum + t.tests.length, 0);
    const avgOverallMs = Object.values(results.tools).reduce((sum, t) => sum + t.avgMs, 0) / Object.keys(results.tools).length;
    const baselineAvg = Object.values(BASELINE).reduce((sum, b) => sum + b.avgMs, 0) / Object.keys(BASELINE).length;
    const overallChange = ((avgOverallMs - baselineAvg) / baselineAvg * 100).toFixed(1);

    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('  OVERALL ASSESSMENT');
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log(`   Total tests run: ${totalTests}`);
    console.log(`   Average response time: ${avgOverallMs.toFixed(2)}ms`);
    console.log(`   Baseline average: ${baselineAvg.toFixed(2)}ms`);
    console.log(`   Overall change: ${overallChange >= 0 ? '+' : ''}${overallChange}%`);
    console.log();

    if (results.validation.failed === 0 && results.performance.regressed === 0) {
      console.log('🎉 All tests passed! No regressions detected.\n');
    } else if (results.performance.regressed > 0) {
      console.log('⚠️  Performance regressions detected. Review above for details.\n');
    }

    // Save results to file
    const outputPath = `../test-results/benchmark-${new Date().toISOString().split('T')[0]}.json`;
    const fs = await import('fs');
    fs.writeFileSync(
      new URL(outputPath, import.meta.url),
      JSON.stringify(results, null, 2)
    );
    console.log(`📊 Results saved to: test-results/benchmark-${new Date().toISOString().split('T')[0]}.json`);

  } catch (error) {
    console.error('\n❌ Benchmark failed:', error.message);
    process.exit(1);
  }
}

main();
