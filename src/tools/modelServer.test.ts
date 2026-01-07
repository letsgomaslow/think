import { describe, it, expect, beforeEach } from 'vitest';
import { ModelServer } from './modelServer.js';

describe('ModelServer', () => {
  let server: ModelServer;

  beforeEach(() => {
    server = new ModelServer();
  });

  it('should process valid mental model data', () => {
    const result = server.processModel({
      modelName: 'first_principles',
      problem: 'Why is the application slow?',
      steps: ['Identify assumptions', 'Break down components'],
      reasoning: 'Starting from fundamentals',
      conclusion: 'Database queries are the bottleneck',
    });

    expect(result.status).toBe('success');
    expect(result.data?.modelName).toBe('first_principles');
    expect(result.data?.hasSteps).toBe(true);
    expect(result.data?.hasConclusion).toBe(true);
  });

  it('should return failed status for missing modelName', () => {
    const result = server.processModel({
      problem: 'test problem',
    });

    expect(result.status).toBe('failed');
    expect(result.error).toBeDefined();
  });

  it('should return failed status for missing problem', () => {
    const result = server.processModel({
      modelName: 'first_principles',
    });

    expect(result.status).toBe('failed');
    expect(result.error).toBeDefined();
  });

  it('should handle optional fields', () => {
    const result = server.processModel({
      modelName: 'pareto_principle',
      problem: 'Where should we focus efforts?',
    });

    expect(result.status).toBe('success');
    expect(result.data?.modelName).toBe('pareto_principle');
    expect(result.data?.hasSteps).toBe(false);
    expect(result.data?.hasConclusion).toBe(false);
  });

  it('should process all mental model types', () => {
    const models = [
      'first_principles',
      'opportunity_cost',
      'error_propagation',
      'rubber_duck',
      'pareto_principle',
      'occams_razor',
    ];

    models.forEach(modelName => {
      const result = server.processModel({
        modelName,
        problem: 'Test problem',
      });
      expect(result.status).toBe('success');
      expect(result.data?.modelName).toBe(modelName);
    });
  });
});
