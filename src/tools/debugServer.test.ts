import { describe, it, expect, beforeEach } from 'vitest';
import { DebugServer } from './debugServer.js';

describe('DebugServer', () => {
  let server: DebugServer;

  beforeEach(() => {
    server = new DebugServer();
  });

  const parseResult = (result: any) => {
    return JSON.parse(result.content[0].text);
  };

  it('should process valid debugging approach data', () => {
    const result = server.processApproach({
      approachName: 'binary_search',
      issue: 'Application crashes on startup',
      steps: ['Disable half the modules', 'Test', 'Narrow down'],
      findings: 'Found the problematic module',
      resolution: 'Fixed null pointer in auth module',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('success');
    expect(parsed.approachName).toBe('binary_search');
    expect(parsed.hasSteps).toBe(true);
    expect(parsed.hasResolution).toBe(true);
  });

  it('should return failed status for missing approachName', () => {
    const result = server.processApproach({
      issue: 'test issue',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('failed');
    expect(parsed.error).toBeDefined();
    expect(result.isError).toBe(true);
  });

  it('should return failed status for missing issue', () => {
    const result = server.processApproach({
      approachName: 'binary_search',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('failed');
    expect(parsed.error).toBeDefined();
    expect(result.isError).toBe(true);
  });

  it('should handle optional fields', () => {
    const result = server.processApproach({
      approachName: 'divide_conquer',
      issue: 'Memory leak detected',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('success');
    expect(parsed.approachName).toBe('divide_conquer');
    expect(parsed.hasSteps).toBe(false);
    expect(parsed.hasResolution).toBe(false);
  });

  it('should process wolf_fence approach', () => {
    const result = server.processApproach({
      approachName: 'wolf_fence',
      issue: 'Intermittent crash in data processing pipeline',
      steps: [
        'Test at midpoint of pipeline',
        'Determine if issue is before or after',
        'Recursively narrow down section',
        'Isolate exact component',
      ],
      findings: 'Issue occurs in data transformation stage',
      resolution: 'Fixed race condition in async transformer',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('success');
    expect(parsed.approachName).toBe('wolf_fence');
    expect(parsed.hasSteps).toBe(true);
    expect(parsed.hasResolution).toBe(true);
  });

  it('should process rubber_duck approach', () => {
    const result = server.processApproach({
      approachName: 'rubber_duck',
      issue: 'Authentication flow not working as expected',
      steps: [
        'Explain what the code should do',
        'Walk through actual implementation',
        'Identify assumptions',
        'Spot the discrepancy',
      ],
      findings: 'Realized token validation logic has incorrect condition',
      resolution: 'Updated conditional to check expiry correctly',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('success');
    expect(parsed.approachName).toBe('rubber_duck');
    expect(parsed.hasSteps).toBe(true);
    expect(parsed.hasResolution).toBe(true);
  });

  it('should process delta_debugging approach', () => {
    const result = server.processApproach({
      approachName: 'delta_debugging',
      issue: 'Test fails with large dataset but passes with small one',
      steps: [
        'Start with full failing test case',
        'Remove half the data',
        'Check if still fails',
        'Continue until minimal failing case found',
      ],
      findings: 'Bug only occurs when array has duplicate values',
      resolution: 'Added deduplication logic before processing',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('success');
    expect(parsed.approachName).toBe('delta_debugging');
    expect(parsed.hasSteps).toBe(true);
    expect(parsed.hasResolution).toBe(true);
  });

  it('should process fault_tree approach', () => {
    const result = server.processApproach({
      approachName: 'fault_tree',
      issue: 'System fails to start in production',
      steps: [
        'Identify top-level failure',
        'Map all possible causes',
        'Analyze each branch systematically',
        'Find root cause combination',
      ],
      findings: 'Database connection AND cache initialization both failing',
      resolution: 'Fixed network configuration and added retry logic',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('success');
    expect(parsed.approachName).toBe('fault_tree');
    expect(parsed.hasSteps).toBe(true);
    expect(parsed.hasResolution).toBe(true);
  });

  it('should process time_travel approach', () => {
    const result = server.processApproach({
      approachName: 'time_travel',
      issue: 'State corruption in complex user workflow',
      steps: [
        'Capture state snapshots at each step',
        'Compare expected vs actual state',
        'Identify where state diverges',
        'Trace back to mutation source',
      ],
      findings: 'State modified incorrectly during concurrent updates',
      resolution: 'Implemented proper state immutability pattern',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('success');
    expect(parsed.approachName).toBe('time_travel');
    expect(parsed.hasSteps).toBe(true);
    expect(parsed.hasResolution).toBe(true);
  });

  it('should handle wolf_fence with optional fields', () => {
    const result = server.processApproach({
      approachName: 'wolf_fence',
      issue: 'Bug somewhere in request handler chain',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('success');
    expect(parsed.approachName).toBe('wolf_fence');
    expect(parsed.hasSteps).toBe(false);
    expect(parsed.hasResolution).toBe(false);
  });

  it('should handle rubber_duck with optional fields', () => {
    const result = server.processApproach({
      approachName: 'rubber_duck',
      issue: 'Logic error in calculation function',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('success');
    expect(parsed.approachName).toBe('rubber_duck');
    expect(parsed.hasSteps).toBe(false);
    expect(parsed.hasResolution).toBe(false);
  });

  it('should process all debugging approaches', () => {
    const approaches = [
      'binary_search',
      'reverse_engineering',
      'divide_conquer',
      'backtracking',
      'cause_elimination',
      'program_slicing',
      'wolf_fence',
      'rubber_duck',
      'delta_debugging',
      'fault_tree',
      'time_travel',
    ];

    approaches.forEach(approachName => {
      const result = server.processApproach({
        approachName,
        issue: 'Test issue',
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('success');
      expect(parsed.approachName).toBe(approachName);
    });
  });
});
