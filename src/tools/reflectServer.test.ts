import { describe, it, expect, beforeEach } from 'vitest';
import { ReflectServer } from './reflectServer.js';

describe('ReflectServer', () => {
  let server: ReflectServer;

  beforeEach(() => {
    server = new ReflectServer();
  });

  const validInput = {
    task: 'Evaluate my understanding of quantum computing',
    stage: 'knowledge-assessment' as const,
    overallConfidence: 0.6,
    uncertaintyAreas: ['Quantum entanglement', 'Error correction'],
    recommendedApproach: 'Start with foundational concepts',
    monitoringId: 'monitor-1',
    iteration: 0,
    nextAssessmentNeeded: true,
  };

  const parseResult = (result: any) => {
    return JSON.parse(result.content[0].text);
  };

  it('should process valid metacognitive monitoring data', () => {
    const result = server.processMetacognitiveMonitoring(validInput);
    const parsed = parseResult(result);

    expect(parsed.status).toBe('success');
    expect(parsed.task).toBe('Evaluate my understanding of quantum computing');
    expect(parsed.overallConfidence).toBe(0.6);
  });

  it('should return failed status for missing required fields', () => {
    const result = server.processMetacognitiveMonitoring({
      task: 'test',
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('failed');
    expect(parsed.error).toBeDefined();
    expect(result.isError).toBe(true);
  });

  it('should return failed status for invalid confidence score', () => {
    const result = server.processMetacognitiveMonitoring({
      ...validInput,
      overallConfidence: 1.5,
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('failed');
    expect(parsed.error).toBeDefined();
    expect(result.isError).toBe(true);
  });

  it('should return failed status for negative confidence score', () => {
    const result = server.processMetacognitiveMonitoring({
      ...validInput,
      overallConfidence: -0.1,
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('failed');
    expect(parsed.error).toBeDefined();
    expect(result.isError).toBe(true);
  });

  it('should return failed status for invalid iteration', () => {
    const result = server.processMetacognitiveMonitoring({
      ...validInput,
      iteration: -1,
    });
    const parsed = parseResult(result);

    expect(parsed.status).toBe('failed');
    expect(parsed.error).toBeDefined();
    expect(result.isError).toBe(true);
  });

  it('should handle all stage types', () => {
    const stages = [
      'knowledge-assessment',
      'planning',
      'execution',
      'monitoring',
      'evaluation',
      'reflection',
    ] as const;

    stages.forEach(stage => {
      const result = server.processMetacognitiveMonitoring({
        ...validInput,
        stage,
      });
      const parsed = parseResult(result);
      expect(parsed.status).toBe('success');
      expect(parsed.stage).toBe(stage);
    });
  });
});
