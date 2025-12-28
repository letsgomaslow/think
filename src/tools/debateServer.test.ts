import { describe, it, expect, beforeEach } from 'vitest';
import { DebateServer } from './debateServer.js';

describe('DebateServer', () => {
  let server: DebateServer;

  beforeEach(() => {
    server = new DebateServer();
  });

  const validInput = {
    claim: 'Remote work improves productivity',
    premises: [
      'Employees have fewer interruptions',
      'No commute saves time and energy',
      'Flexible schedules improve work-life balance',
    ],
    conclusion: 'Companies should embrace remote work policies',
    argumentType: 'thesis' as const,
    confidence: 0.8,
    nextArgumentNeeded: true,
  };

  const parseResult = (result: any) => {
    return JSON.parse(result.content[0].text);
  };

  it('should process valid structured argumentation data', () => {
    const result = server.processStructuredArgumentation(validInput);
    const parsed = parseResult(result);

    expect(parsed.status).toBe('success');
    expect(parsed.claim).toBe('Remote work improves productivity');
    expect(parsed.argumentType).toBe('thesis');
    expect(parsed.confidence).toBe(0.8);
  });

  it('should return failed status for missing required fields', () => {
    const result = server.processStructuredArgumentation({
      claim: 'test',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('failed');
    expect(parsed.error).toBeDefined();
    expect(result.isError).toBe(true);
  });

  it('should return failed status for invalid confidence score', () => {
    const result = server.processStructuredArgumentation({
      ...validInput,
      confidence: 1.5,
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('failed');
    expect(parsed.error).toBeDefined();
    expect(result.isError).toBe(true);
  });

  it('should return failed status for negative confidence score', () => {
    const result = server.processStructuredArgumentation({
      ...validInput,
      confidence: -0.1,
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('failed');
    expect(parsed.error).toBeDefined();
    expect(result.isError).toBe(true);
  });

  it('should return failed status for invalid nextArgumentNeeded type', () => {
    const result = server.processStructuredArgumentation({
      ...validInput,
      nextArgumentNeeded: 'yes',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('failed');
    expect(parsed.error).toBeDefined();
    expect(result.isError).toBe(true);
  });

  it('should handle all argument types', () => {
    const types = [
      'thesis',
      'antithesis',
      'synthesis',
      'objection',
      'rebuttal',
    ] as const;

    types.forEach(argumentType => {
      const result = server.processStructuredArgumentation({
        ...validInput,
        argumentType,
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('success');
      expect(parsed.argumentType).toBe(argumentType);
    });
  });

  it('should handle optional argument relationships', () => {
    const result = server.processStructuredArgumentation({
      ...validInput,
      argumentId: 'arg-1',
      respondsTo: 'arg-0',
      supports: ['arg-2', 'arg-3'],
      contradicts: ['arg-4'],
      strengths: ['Well-supported by data'],
      weaknesses: ['Limited sample size'],
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('success');
    expect(parsed.argumentId).toBe('arg-1');
  });
});
