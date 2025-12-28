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

  const parseResult = (result: any) => {
    return JSON.parse(result.content[0].text);
  };

  it('should process valid scientific method data', () => {
    const result = server.processScientificMethod(validInput);
    const parsed = parseResult(result);

    expect(parsed.status).toBe('success');
    expect(parsed.stage).toBe('hypothesis');
    expect(parsed.inquiryId).toBe('inquiry-1');
  });

  it('should return failed status for missing required fields', () => {
    const result = server.processScientificMethod({
      stage: 'observation',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('failed');
    expect(parsed.error).toBeDefined();
    expect(result.isError).toBe(true);
  });

  it('should return failed status for invalid iteration', () => {
    const result = server.processScientificMethod({
      ...validInput,
      iteration: -1,
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('failed');
    expect(parsed.error).toBeDefined();
    expect(result.isError).toBe(true);
  });

  it('should return failed status for invalid nextStageNeeded type', () => {
    const result = server.processScientificMethod({
      ...validInput,
      nextStageNeeded: 'yes',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('failed');
    expect(parsed.error).toBeDefined();
    expect(result.isError).toBe(true);
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
      const parsed = parseResult(result);
      expect(parsed.status).toBe('success');
      expect(parsed.stage).toBe(stage);
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
    const parsed = parseResult(result);

    expect(parsed.status).toBe('success');
  });
});
