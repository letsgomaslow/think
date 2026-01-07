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

  it('should process valid metacognitive monitoring data', () => {
    const result = server.processMetacognitiveMonitoring(validInput);

    expect(result.status).toBe('success');
    expect(result.data?.task).toBe('Evaluate my understanding of quantum computing');
    expect(result.data?.overallConfidence).toBe(0.6);
  });

  it('should return failed status for missing required fields', () => {
    const result = server.processMetacognitiveMonitoring({
      task: 'test',
    });

    expect(result.status).toBe('failed');
    expect(result.error).toBeDefined();
  });

  it('should return failed status for invalid confidence score', () => {
    const result = server.processMetacognitiveMonitoring({
      ...validInput,
      overallConfidence: 1.5,
    });

    expect(result.status).toBe('failed');
    expect(result.error).toBeDefined();
  });

  it('should return failed status for negative confidence score', () => {
    const result = server.processMetacognitiveMonitoring({
      ...validInput,
      overallConfidence: -0.1,
    });

    expect(result.status).toBe('failed');
    expect(result.error).toBeDefined();
  });

  it('should return failed status for invalid iteration', () => {
    const result = server.processMetacognitiveMonitoring({
      ...validInput,
      iteration: -1,
    });

    expect(result.status).toBe('failed');
    expect(result.error).toBeDefined();
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
      expect(result.status).toBe('success');
      expect(result.data?.stage).toBe(stage);
    });
  });
});
