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

  it('should process valid structured argumentation data', () => {
    const result = server.processStructuredArgumentation(validInput);

    expect(result.status).toBe('success');
    expect(result.data?.claim).toBe('Remote work improves productivity');
    expect(result.data?.argumentType).toBe('thesis');
    expect(result.data?.confidence).toBe(0.8);
  });

  it('should return failed status for missing required fields', () => {
    const result = server.processStructuredArgumentation({
      claim: 'test',
    });

    expect(result.status).toBe('failed');
    expect(result.error).toBeDefined();
  });

  it('should return failed status for invalid confidence score', () => {
    const result = server.processStructuredArgumentation({
      ...validInput,
      confidence: 1.5,
    });

    expect(result.status).toBe('failed');
    expect(result.error).toBeDefined();
  });

  it('should return failed status for negative confidence score', () => {
    const result = server.processStructuredArgumentation({
      ...validInput,
      confidence: -0.1,
    });

    expect(result.status).toBe('failed');
    expect(result.error).toBeDefined();
  });

  it('should return failed status for invalid nextArgumentNeeded type', () => {
    const result = server.processStructuredArgumentation({
      ...validInput,
      nextArgumentNeeded: 'yes',
    });

    expect(result.status).toBe('failed');
    expect(result.error).toBeDefined();
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
      expect(result.status).toBe('success');
      expect(result.data?.argumentType).toBe(argumentType);
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

    expect(result.status).toBe('success');
    expect(result.data?.argumentId).toBe('arg-1');
  });
});
