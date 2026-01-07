import { describe, it, expect, beforeEach } from 'vitest';
import { HypothesisServer } from './hypothesisServer.js';

describe('HypothesisServer', () => {
  let server: HypothesisServer;

  beforeEach(() => {
    server = new HypothesisServer();
  });

  const validInput = {
    stage: 'hypothesis' as const,
    inquiryId: 'inquiry-1',
    iteration: 0,
    nextStageNeeded: true,
    observation: 'Users are abandoning checkout',
    question: 'Why are users not completing purchases?',
  };

  it('should process valid scientific method data', () => {
    const result = server.processScientificMethod(validInput);

    expect(result.status).toBe('success');
    expect(result.data?.stage).toBe('hypothesis');
    expect(result.data?.inquiryId).toBe('inquiry-1');
  });

  it('should return failed status for missing required fields', () => {
    const result = server.processScientificMethod({
      stage: 'observation',
    });

    expect(result.status).toBe('failed');
    expect(result.error).toBeDefined();
  });

  it('should return failed status for invalid iteration', () => {
    const result = server.processScientificMethod({
      ...validInput,
      iteration: -1,
    });

    expect(result.status).toBe('failed');
    expect(result.error).toBeDefined();
  });

  it('should return failed status for invalid nextStageNeeded type', () => {
    const result = server.processScientificMethod({
      ...validInput,
      nextStageNeeded: 'yes',
    });

    expect(result.status).toBe('failed');
    expect(result.error).toBeDefined();
  });

  it('should handle all stage types', () => {
    const stages = [
      'observation',
      'question',
      'hypothesis',
      'experiment',
      'analysis',
      'conclusion',
      'iteration',
    ] as const;

    stages.forEach(stage => {
      const result = server.processScientificMethod({
        ...validInput,
        stage,
      });
      expect(result.status).toBe('success');
      expect(result.data?.stage).toBe(stage);
    });
  });

  it('should handle hypothesis with variables', () => {
    const result = server.processScientificMethod({
      ...validInput,
      hypothesis: {
        statement: 'Slow checkout causes abandonment',
        variables: [
          { name: 'checkout_time', type: 'independent' },
          { name: 'abandonment_rate', type: 'dependent' },
        ],
        assumptions: ['Users have stable internet'],
        hypothesisId: 'h1',
        confidence: 0.7,
        domain: 'UX',
        iteration: 0,
        status: 'proposed',
      },
    });

    expect(result.status).toBe('success');
  });
});
