import { describe, it, expect, beforeEach } from 'vitest';
import { DecideServer } from './decideServer.js';

describe('DecideServer', () => {
  let server: DecideServer;

  beforeEach(() => {
    server = new DecideServer();
  });

  const validInput = {
    decisionStatement: 'Which database should we use?',
    options: [
      { id: 'pg', name: 'PostgreSQL', description: 'Relational database' },
      { id: 'mongo', name: 'MongoDB', description: 'Document database' },
    ],
    analysisType: 'weighted-criteria' as const,
    stage: 'evaluation' as const,
    decisionId: 'db-decision-1',
    iteration: 0,
    nextStageNeeded: true,
  };

  it('should process valid decision framework data', () => {
    const result = server.processDecisionFramework(validInput);

    expect(result.decisionStatement).toBe('Which database should we use?');
    expect(result.analysisType).toBe('weighted-criteria');
    expect(result.options).toHaveLength(2);
  });

  it('should reject missing required fields', () => {
    expect(() => server.processDecisionFramework({
      decisionStatement: 'test',
    })).toThrow();
  });

  it('should reject invalid iteration', () => {
    expect(() => server.processDecisionFramework({
      ...validInput,
      iteration: -1,
    })).toThrow();
  });

  it('should reject invalid nextStageNeeded type', () => {
    expect(() => server.processDecisionFramework({
      ...validInput,
      nextStageNeeded: 'yes',
    })).toThrow();
  });

  it('should handle all analysis types', () => {
    const types = [
      'pros-cons',
      'weighted-criteria',
      'decision-tree',
      'expected-value',
      'scenario-analysis',
    ] as const;

    types.forEach(analysisType => {
      const result = server.processDecisionFramework({
        ...validInput,
        analysisType,
      });
      expect(result.analysisType).toBe(analysisType);
    });
  });

  it('should handle all stage types', () => {
    const stages = [
      'problem-definition',
      'options-generation',
      'criteria-definition',
      'evaluation',
      'sensitivity-analysis',
      'decision',
    ] as const;

    stages.forEach(stage => {
      const result = server.processDecisionFramework({
        ...validInput,
        stage,
      });
      expect(result.stage).toBe(stage);
    });
  });
});
