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

  it('should process all debugging approaches', () => {
    const approaches = [
      'binary_search',
      'reverse_engineering',
      'divide_conquer',
      'backtracking',
      'cause_elimination',
      'program_slicing',
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
